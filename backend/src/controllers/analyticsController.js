const pool = require('../db/pool')

// GET /api/analytics
async function getAnalytics(req, res) {
  const user_id = req.user.id

  try {
    const [
      dailyActivity,
      difficultyPerformance,
      topicPerformance,
      recentTrend,
      overallStats,
    ] = await Promise.all([

      // Daily activity — questions attempted per day (last 30 days)
      pool.query(
        `SELECT
          DATE(attempted_at) AS date,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE is_correct = true) AS correct
         FROM user_attempts
         WHERE user_id = $1
           AND attempted_at >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(attempted_at)
         ORDER BY date ASC`,
        [user_id]
      ),

      // Performance by difficulty
      pool.query(
        `SELECT
          q.difficulty,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE ua.is_correct = true) AS correct,
          ROUND(AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0 END)) AS accuracy
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = $1
         GROUP BY q.difficulty
         ORDER BY
           CASE q.difficulty
             WHEN 'Easy' THEN 1
             WHEN 'Medium' THEN 2
             WHEN 'Hard' THEN 3
           END`,
        [user_id]
      ),

      // Topic performance — sorted by accuracy
      pool.query(
        `SELECT
          q.topic,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE ua.is_correct = true) AS correct,
          ROUND(AVG(CASE WHEN ua.is_correct THEN 100.0 ELSE 0 END)) AS accuracy
         FROM user_attempts ua
         JOIN questions q ON ua.question_id = q.id
         WHERE ua.user_id = $1
         GROUP BY q.topic
         ORDER BY accuracy DESC`,
        [user_id]
      ),

      // Recent trend — accuracy per day (last 14 days)
      pool.query(
        `SELECT
          DATE(attempted_at) AS date,
          ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END)) AS accuracy,
          COUNT(*) AS questions
         FROM user_attempts
         WHERE user_id = $1
           AND attempted_at >= NOW() - INTERVAL '14 days'
         GROUP BY DATE(attempted_at)
         ORDER BY date ASC`,
        [user_id]
      ),

      // Overall stats
      pool.query(
        `SELECT
          COUNT(*) AS total_attempts,
          COUNT(*) FILTER (WHERE is_correct = true) AS total_correct,
          COUNT(DISTINCT question_id) AS unique_questions,
          COUNT(DISTINCT DATE(attempted_at)) AS active_days,
          ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END)) AS overall_accuracy
         FROM user_attempts
         WHERE user_id = $1`,
        [user_id]
      ),
    ])

    const stats = overallStats.rows[0]

    res.json({
      overallStats: {
        totalAttempts:    parseInt(stats.total_attempts)   || 0,
        totalCorrect:     parseInt(stats.total_correct)    || 0,
        uniqueQuestions:  parseInt(stats.unique_questions) || 0,
        activeDays:       parseInt(stats.active_days)      || 0,
        overallAccuracy:  parseInt(stats.overall_accuracy) || 0,
      },
      dailyActivity:        dailyActivity.rows.map((r) => ({
        date:    r.date.toISOString().split('T')[0],
        total:   parseInt(r.total),
        correct: parseInt(r.correct),
      })),
      difficultyPerformance: difficultyPerformance.rows.map((r) => ({
        difficulty: r.difficulty,
        total:      parseInt(r.total),
        correct:    parseInt(r.correct),
        accuracy:   parseInt(r.accuracy),
      })),
      topicPerformance: topicPerformance.rows.map((r) => ({
        topic:    r.topic,
        total:    parseInt(r.total),
        correct:  parseInt(r.correct),
        accuracy: parseInt(r.accuracy),
      })),
      recentTrend: recentTrend.rows.map((r) => ({
        date:      r.date.toISOString().split('T')[0],
        accuracy:  parseInt(r.accuracy),
        questions: parseInt(r.questions),
      })),
    })
  } catch (err) {
    console.error('Analytics error:', err.message)
    res.status(500).json({ error: 'Server error fetching analytics' })
  }
}

module.exports = { getAnalytics }