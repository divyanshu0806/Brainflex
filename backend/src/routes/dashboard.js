const express = require('express')
const router = express.Router()
const { getDashboardStats, getSolvedQuestions, getAttemptedQuestions } = require('../controllers/statsController')
const { getExplanation } = require('../controllers/explainController')
const auth = require('../middleware/auth')

router.get('/stats',     auth, getDashboardStats)
router.get('/solved',    auth, getSolvedQuestions)
router.get('/attempted', auth, getAttemptedQuestions)
router.post('/explain',  auth, getExplanation)

module.exports = router