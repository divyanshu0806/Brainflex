const pool = require('../db/pool')

// GET /api/stats  — dashboard home data
async function getDashboardStats(req, res) {
  const user_id = req.user.id

  try {
    const [solved, accuracy, streak, recentAttempts, topicStrength] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(DISTINCT question_id) FILTER (WHERE is_correct = true) AS solved,
          COUNT(DISTINCT question_id) AS attempted,
          (SELECT COUNT(*) FROM questions) AS total
         FROM user_attempts WHERE user_id = $1`,
        [user_id]
      ),
      pool.query(
        `SELECT q.difficulty,
          ROUND(AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0 END)) AS accuracy
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = $1
         GROUP BY q.difficulty`,
        [user_id]
      ),
      pool.query(
        'SELECT current_streak, longest_streak FROM streaks WHERE user_id = $1',
        [user_id]
      ),
      pool.query(
        `SELECT title, score, total_qs, duration_secs, completed_at
         FROM test_sessions WHERE user_id = $1
         ORDER BY completed_at DESC LIMIT 3`,
        [user_id]
      ),
      pool.query(
        `SELECT q.topic,
          ROUND(AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0 END)) AS strength
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = $1
         GROUP BY q.topic
         ORDER BY strength DESC`,
        [user_id]
      ),
    ])

    const s = solved.rows[0]
    const totalQs = parseInt(s.total) || 1

    res.json({
      summary: {
        solved: parseInt(s.solved) || 0,
        attempted: parseInt(s.attempted) || 0,
        total: parseInt(s.total) || 0,
        completionRate: Math.round((parseInt(s.attempted) / totalQs) * 100),
      },
      streak: streak.rows[0] || { current_streak: 0, longest_streak: 0 },
      accuracyByDifficulty: accuracy.rows,
      topicStrength: topicStrength.rows,
      recentTests: recentAttempts.rows,
    })
  } catch (err) {
    console.error('Stats error:', err.message)
    res.status(500).json({ error: 'Server error fetching stats' })
  }
}

// GET /api/solved  — all questions the user got correct
async function getSolvedQuestions(req, res) {
  const user_id = req.user.id

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (ua.question_id)
        q.id, q.question_text, q.topic, q.difficulty,
        e.name AS exam,
        ua.attempted_at,
        (SELECT COUNT(*) FROM user_attempts ua2
         WHERE ua2.question_id = q.id) AS total_attempts,
        (SELECT COUNT(*) FROM user_attempts ua3
         WHERE ua3.question_id = q.id AND ua3.is_correct = true) AS correct_attempts
       FROM user_attempts ua
       JOIN questions q ON ua.question_id = q.id
       JOIN exams e ON q.exam_id = e.id
       WHERE ua.user_id = $1 AND ua.is_correct = true
       ORDER BY ua.question_id, ua.attempted_at DESC`,
      [user_id]
    )

    const questions = result.rows.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      topic: q.topic,
      difficulty: q.difficulty,
      exam: q.exam,
      attempted_at: q.attempted_at,
      accuracy: Math.round((parseInt(q.correct_attempts) / parseInt(q.total_attempts)) * 100),
      status: 'solved',
    }))

    // Summary by difficulty
    const summary = {
      Easy:   { solved: 0, total: 0 },
      Medium: { solved: 0, total: 0 },
      Hard:   { solved: 0, total: 0 },
    }

    // Get total questions per difficulty
    const totals = await pool.query(
      `SELECT difficulty, COUNT(*) as total FROM questions GROUP BY difficulty`
    )
    totals.rows.forEach((r) => {
      if (summary[r.difficulty]) summary[r.difficulty].total = parseInt(r.total)
    })

    // Count solved per difficulty
    questions.forEach((q) => {
      if (summary[q.difficulty]) summary[q.difficulty].solved++
    })

    res.json({ questions, summary })
  } catch (err) {
    console.error('Solved error:', err.message)
    res.status(500).json({ error: 'Server error fetching solved questions' })
  }
}

// GET /api/attempted  — all questions the user has attempted
async function getAttemptedQuestions(req, res) {
  const user_id = req.user.id

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (ua.question_id)
        q.id, q.question_text, q.topic, q.difficulty,
        e.name AS exam,
        ua.is_correct,
        ua.attempted_at,
        (SELECT COUNT(*) FROM user_attempts ua2
         WHERE ua2.question_id = q.id AND ua2.user_id = $1) AS attempt_count,
        (SELECT COUNT(*) FROM user_attempts ua3
         WHERE ua3.question_id = q.id AND ua3.user_id = $1 AND ua3.is_correct = true) AS correct_count
       FROM user_attempts ua
       JOIN questions q ON ua.question_id = q.id
       JOIN exams e ON q.exam_id = e.id
       WHERE ua.user_id = $1
       ORDER BY ua.question_id, ua.attempted_at DESC`,
      [user_id]
    )

    const questions = result.rows.map((q) => {
      const attempts = parseInt(q.attempt_count)
      const correct  = parseInt(q.correct_count)
      return {
        id: q.id,
        question_text: q.question_text,
        topic: q.topic,
        difficulty: q.difficulty,
        exam: q.exam,
        attempted_at: q.attempted_at,
        accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
        status: correct > 0 ? 'solved' : 'attempted',
        attempt_count: attempts,
      }
    })

    // Stats summary
    const scores = questions.map((q) => q.accuracy)
    const summary = {
      total: questions.length,
      solved: questions.filter((q) => q.status === 'solved').length,
      avgAccuracy: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestAccuracy: scores.length > 0 ? Math.max(...scores) : 0,
    }

    res.json({ questions, summary })
  } catch (err) {
    console.error('Attempted error:', err.message)
    res.status(500).json({ error: 'Server error fetching attempted questions' })
  }
}

module.exports = { getDashboardStats, getSolvedQuestions, getAttemptedQuestions }