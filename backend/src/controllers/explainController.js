const pool = require('../db/pool')

const GROQ_MODELS = [
  process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
]

// Resilient helper to call Groq with automatic model fallbacks
async function callGroqChat(messages, max_tokens = 700, temperature = 0.3) {
  let lastError = null

  for (const model of GROQ_MODELS) {
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens,
          temperature,
        }),
      })

      if (groqResponse.ok) {
        const groqData = await groqResponse.json()
        const content = groqData.choices?.[0]?.message?.content
        if (content) return content
      } else {
        const err = await groqResponse.json().catch(() => ({}))
        console.warn(`Groq model ${model} failed (${groqResponse.status}):`, err?.error?.message || err)
        lastError = err?.error?.message || 'API request rejected'
      }
    } catch (err) {
      console.warn(`Groq request error for model ${model}:`, err.message)
      lastError = err.message
    }
  }

  throw new Error(lastError || 'All AI models were temporarily unreachable')
}

// POST /api/explain
async function getExplanation(req, res) {
  const { question_id, option_id } = req.body

  if (!question_id || !option_id) {
    return res.status(400).json({ error: 'question_id and option_id are required' })
  }

  try {
    // Check cache first
    const cached = await pool.query(
      'SELECT explanation FROM ai_explanations WHERE question_id = $1 AND option_id = $2',
      [question_id, option_id]
    )
    if (cached.rows.length > 0) {
      return res.json({ explanation: cached.rows[0].explanation, cached: true })
    }

    // Fetch question + all options
    const qResult = await pool.query(
      'SELECT question_text, difficulty, topic FROM questions WHERE id = $1',
      [question_id]
    )
    if (qResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' })
    }

    const question = qResult.rows[0]
    const optResult = await pool.query(
      'SELECT id, option_text, is_correct FROM options WHERE question_id = $1',
      [question_id]
    )
    const options = optResult.rows
    const selectedOption = options.find((o) => o.id === parseInt(option_id))
    const correctOption  = options.find((o) => o.is_correct)
    const isCorrect = selectedOption?.is_correct

    // Build prompt based on correct/incorrect
    let prompt

    if (isCorrect) {
      prompt = `You are an expert tutor for competitive exams (UPSC, SSC, IBPS).

Question (${question.difficulty} | ${question.topic}): ${question.question_text}

The student selected the CORRECT answer: "${selectedOption?.option_text}" ✅

Give an AI Overview of "${selectedOption?.option_text}" with:
1. A clear definition
2. 3-4 interesting facts relevant to competitive exams
3. Why this is the correct answer in this context
4. A quick memory tip or mnemonic if applicable

Keep it concise, factual, and exam-focused. Format with clear sections.`
    } else {
      prompt = `You are an expert tutor for competitive exams (UPSC, SSC, IBPS).

Question (${question.difficulty} | ${question.topic}): ${question.question_text}

The student selected: "${selectedOption?.option_text}" ❌ (INCORRECT)
The correct answer is: "${correctOption?.option_text}" ✅

Give two AI Overviews:

## 🔴 "${selectedOption?.option_text}" (Your Answer — Incorrect)
1. What it actually is — clear definition
2. 2-3 key facts about it
3. Why it is NOT the answer to this question

## 🟢 "${correctOption?.option_text}" (Correct Answer)
1. Clear definition of why this is correct
2. 3-4 key facts relevant to competitive exams
3. A quick memory tip or mnemonic

Keep it concise, educational, and exam-focused.`
    }

    const explanation = await callGroqChat(
      [{ role: 'user', content: prompt }],
      800,
      0.3
    )

    // Cache it
    await pool.query(
      `INSERT INTO ai_explanations (question_id, option_id, explanation)
       VALUES ($1, $2, $3)
       ON CONFLICT (question_id, option_id) DO UPDATE SET explanation = $3`,
      [question_id, option_id, explanation]
    )

    res.json({ explanation, cached: false })
  } catch (err) {
    console.error('Explain error:', err.message)
    res.status(500).json({ error: 'Server error generating explanation: ' + err.message })
  }
}

// POST /api/explain/chat — Interactive AI Tutor follow-up chat
async function chatWithTutor(req, res) {
  const { question_id, selected_option_id, messages } = req.body

  if (!question_id || !messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'question_id and messages array are required' })
  }

  try {
    // Fetch question details
    const qResult = await pool.query(
      `SELECT q.question_text, q.difficulty, q.topic, e.name AS exam_name
       FROM questions q
       LEFT JOIN exams e ON q.exam_id = e.id
       WHERE q.id = $1`,
      [question_id]
    )

    if (qResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' })
    }

    const question = qResult.rows[0]

    // Fetch options
    const optResult = await pool.query(
      'SELECT id, option_text, is_correct FROM options WHERE question_id = $1 ORDER BY id ASC',
      [question_id]
    )
    const options = optResult.rows
    const selectedOption = selected_option_id
      ? options.find((o) => o.id === parseInt(selected_option_id))
      : null
    const correctOption = options.find((o) => o.is_correct)

    const systemPrompt = `You are BrainFlex AI Tutor, an expert, inspiring, and concise mentor for Indian competitive exams (UPSC CSE, SSC CGL, IBPS PO, State PSCs).

Context for this question:
- Exam: ${question.exam_name || 'General Competitive Exam'}
- Topic: ${question.topic}
- Difficulty: ${question.difficulty}
- Question: "${question.question_text}"
- Options:
${options.map((o, idx) => `  ${String.fromCharCode(65 + idx)}. ${o.option_text} ${o.is_correct ? '✅ [Correct Answer]' : ''}`).join('\n')}
${selectedOption ? `- Student's Selected Answer: "${selectedOption.option_text}" ${selectedOption.is_correct ? '✅ (Correct)' : '❌ (Incorrect)'}` : ''}
${correctOption ? `- Correct Answer: "${correctOption.option_text}"` : ''}

Instructions:
1. Answer the student's question/doubt directly with high exam relevance.
2. If asked for mnemonics or memory tricks, provide catchy and memorable ones.
3. If asked why an option is incorrect or confusing, explain the common trap/distractor.
4. Keep explanations crisp, educational, and well-structured using bullet points where appropriate.
5. Limit responses to around 150-250 words so the student stays focused and fast in practice mode.`

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-8).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content),
      })),
    ]

    const reply = await callGroqChat(groqMessages, 600, 0.4)

    res.json({ reply })
  } catch (err) {
    console.error('Tutor chat error:', err.message)
    res.status(500).json({ error: 'Server error communicating with AI Tutor: ' + err.message })
  }
}

module.exports = { getExplanation, chatWithTutor }