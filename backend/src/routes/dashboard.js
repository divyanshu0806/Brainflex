const express = require('express')
const router = express.Router()
const { getDashboardStats, getSolvedQuestions, getAttemptedQuestions } = require('../controllers/statsController')
const { getExplanation, chatWithTutor } = require('../controllers/explainController')
const { getAnalytics } = require('../controllers/analyticsController')
const auth = require('../middleware/auth')

router.get('/stats',         auth, getDashboardStats)
router.get('/solved',        auth, getSolvedQuestions)
router.get('/attempted',     auth, getAttemptedQuestions)
router.get('/analytics',     auth, getAnalytics)
router.post('/explain',      auth, getExplanation)
router.post('/explain/chat', auth, chatWithTutor)

module.exports = router