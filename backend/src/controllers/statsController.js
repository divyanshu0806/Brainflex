const pool = require('../db/pool')

// GET /api/stats  — everything the dashboard home needs
async function getDashboardStats(req, res) {
  const user_id = req.user.id

  try {
    const [solved, accuracy, streak, recentAttempts, topicStrength] = await Promise.all([
      // Total solved + completion rate
      pool.query(
        `SELECT
          COUNT(DISTINCT question_id) FILTER (WHERE is_correct = true) AS solved,
          COUNT(DISTINCT question_id) AS attempted,
          (SELECT COUNT(*) FROM questions) AS total
         FROM user_attempts WHERE user_id = $1`,
        [user_id]
      ),

      // Accuracy by difficulty
      pool.query(
        `SELECT q.difficulty,
          ROUND(AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0 END)) AS accuracy
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = $1
         GROUP BY q.difficulty`,
        [user_id]
      ),

      // Streak
      pool.query(
        'SELECT current_streak, longest_streak FROM streaks WHERE user_id = $1',
        [user_id]
      ),

      // Recent 3 test sessions
      pool.query(
        `SELECT title, score, total_qs, duration_secs, completed_at
         FROM test_sessions WHERE user_id = $1
         ORDER BY completed_at DESC LIMIT 3`,
        [user_id]
      ),

      // Topic strength
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

module.exports = { getDashboardStats }
