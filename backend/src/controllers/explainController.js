const pool = require('../db/pool')

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

The student selected the CORRECT answer: "${selectedOption.option_text}" ✅

Give an AI Overview of "${selectedOption.option_text}" with:
1. A clear definition
2. 3-4 interesting facts relevant to competitive exams
3. Why this is the correct answer in this context
4. A quick memory tip or mnemonic if applicable

Keep it concise, factual, and exam-focused. Format with clear sections.`
    } else {
      prompt = `You are an expert tutor for competitive exams (UPSC, SSC, IBPS).

Question (${question.difficulty} | ${question.topic}): ${question.question_text}

The student selected: "${selectedOption.option_text}" ❌ (INCORRECT)
The correct answer is: "${correctOption?.option_text}" ✅

Give two AI Overviews:

## 🔴 "${selectedOption.option_text}" (Your Answer — Incorrect)
1. What it actually is — clear definition
2. 2-3 key facts about it
3. Why it is NOT the answer to this question

## 🟢 "${correctOption?.option_text}" (Correct Answer)
1. Clear definition of why this is correct
2. 3-4 key facts relevant to competitive exams
3. A quick memory tip or mnemonic

Keep it concise, educational, and exam-focused.`
    }

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    if (!groqResponse.ok) {
      const err = await groqResponse.json()
      console.error('Groq API error:', err)
      return res.status(502).json({ error: 'AI service unavailable' })
    }

    const groqData = await groqResponse.json()
    const explanation = groqData.choices[0].message.content

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
    res.status(500).json({ error: 'Server error generating explanation' })
  }
}

module.exports = { getExplanation }