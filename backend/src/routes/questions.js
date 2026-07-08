const express = require('express')
const router = express.Router()
const { getQuestions, getQuestion, submitAnswer } = require('../controllers/questionsController')
const auth = require('../middleware/auth')

router.get('/',      auth, getQuestions)
router.get('/:id',   auth, getQuestion)
router.post('/:id/answer', auth, submitAnswer)

module.exports = router
