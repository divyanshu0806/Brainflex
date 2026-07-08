const express = require('express')
const router = express.Router()
const { getDashboardStats } = require('../controllers/statsController')
const { getExplanation } = require('../controllers/explainController')
const auth = require('../middleware/auth')

router.get('/stats', auth, getDashboardStats)
router.post('/explain', auth, getExplanation)

module.exports = router
