const pool = require('../db/pool')

// GET /api/questions  — with optional ?difficulty=Easy&topic=UPSC&exam=upsc
async function getQuestions(req, res) {
  const { difficulty, topic, exam } = req.query

  let query = `
    SELECT
      q.id, q.topic, q.difficulty, q.question_text,
      e.name AS exam_name, e.slug AS exam_slug,
      (SELECT COUNT(*) FROM user_attempts ua WHERE ua.question_id = q.id AND ua.user_id = $1) AS attempt_count,
      (SELECT COUNT(*) FROM user_attempts ua WHERE ua.question_id = q.id AND ua.user_id = $1 AND ua.is_correct = true) AS correct_count
    FROM questions q
    JOIN exams e ON q.exam_id = e.id
    WHERE 1=1
  `
  const params = [req.user.id]
  let idx = 2

  if (difficulty) { query += ` AND q.difficulty = $${idx++}`; params.push(difficulty) }
  if (topic)      { query += ` AND q.topic ILIKE $${idx++}`; params.push(`%${topic}%`) }
  if (exam)       { query += ` AND e.slug = $${idx++}`;      params.push(exam) }

  query += ' ORDER BY q.id'

  try {
    const result = await pool.query(query, params)

    // Compute accuracy and status per question
    const questions = result.rows.map((q) => {
      const attempts = parseInt(q.attempt_count)
      const correct  = parseInt(q.correct_count)
      const acc = attempts > 0 ? Math.round((correct / attempts) * 100) : null

      let status = 'unsolved'
      if (correct > 0) status = 'solved'
      else if (attempts > 0) status = 'attempted'

      return {
        id: q.id,
        topic: q.topic,
        difficulty: q.difficulty,
        question_text: q.question_text,
        exam: q.exam_name,
        exam_slug: q.exam_slug,
        accuracy: acc,
        status,
      }
    })

    res.json({ questions })
  } catch (err) {
    console.error('Get questions error:', err.message)
    res.status(500).json({ error: 'Server error fetching questions' })
  }
}

// GET /api/questions/:id  — single question with options (options shuffled, correct not revealed)
async function getQuestion(req, res) {
  const { id } = req.params

  try {
    const qResult = await pool.query(
      `SELECT q.id, q.topic, q.difficulty, q.question_text, e.name AS exam_name
       FROM questions q JOIN exams e ON q.exam_id = e.id
       WHERE q.id = $1`,
      [id]
    )

    if (qResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' })
    }

    const optResult = await pool.query(
      'SELECT id, option_text FROM options WHERE question_id = $1 ORDER BY RANDOM()',
      [id]
    )

    res.json({
      question: {
        ...qResult.rows[0],
        options: optResult.rows, // is_correct NOT sent to client
      },
    })
  } catch (err) {
    console.error('Get question error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/questions/:id/answer  — submit an answer, get result + AI explanation
async function submitAnswer(req, res) {
  const { id } = req.params
  const { selected_option_id } = req.body
  const user_id = req.user.id

  if (!selected_option_id) {
    return res.status(400).json({ error: 'selected_option_id is required' })
  }

  try {
    // Check if selected option is correct
    const optResult = await pool.query(
      'SELECT id, option_text, is_correct FROM options WHERE id = $1 AND question_id = $2',
      [selected_option_id, id]
    )

    if (optResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid option for this question' })
    }

    const selectedOption = optResult.rows[0]
    const is_correct = selectedOption.is_correct

    // Record the attempt
    await pool.query(
      `INSERT INTO user_attempts (user_id, question_id, selected_option_id, is_correct)
       VALUES ($1, $2, $3, $4)`,
      [user_id, id, selected_option_id, is_correct]
    )

    // Fetch all options with correct answer revealed
    const allOptions = await pool.query(
      'SELECT id, option_text, is_correct FROM options WHERE question_id = $1',
      [id]
    )

    // Fetch cached AI explanation for the selected option
    const explResult = await pool.query(
      'SELECT explanation FROM ai_explanations WHERE question_id = $1 AND option_id = $2',
      [id, selected_option_id]
    )

    const explanation = explResult.rows.length > 0
      ? explResult.rows[0].explanation
      : null // null means frontend should call /api/explain to generate live

    // Update streak
    await updateStreak(user_id)

    res.json({
      is_correct,
      selected_option_id,
      correct_option_id: allOptions.rows.find((o) => o.is_correct)?.id,
      all_options: allOptions.rows,
      explanation, // pre-cached or null (triggers live generation on frontend)
    })
  } catch (err) {
    console.error('Submit answer error:', err.message)
    res.status(500).json({ error: 'Server error submitting answer' })
  }
}

// Helper — update user streak on activity
async function updateStreak(user_id) {
  try {
    const result = await pool.query(
      'SELECT current_streak, last_active_date FROM streaks WHERE user_id = $1',
      [user_id]
    )
    if (result.rows.length === 0) return

    const { current_streak, last_active_date } = result.rows[0]
    const today = new Date().toISOString().split('T')[0]
    const lastActive = last_active_date?.toISOString?.().split('T')[0] || null

    let newStreak = current_streak
    if (lastActive === today) return // already active today
    if (lastActive === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
      newStreak = current_streak + 1 // consecutive day
    } else {
      newStreak = 1 // streak broken
    }

    await pool.query(
      `UPDATE streaks SET current_streak = $1, last_active_date = $2,
       longest_streak = GREATEST(longest_streak, $1) WHERE user_id = $3`,
      [newStreak, today, user_id]
    )
  } catch (err) {
    console.error('Streak update error:', err.message)
  }
}

module.exports = { getQuestions, getQuestion, submitAnswer }
