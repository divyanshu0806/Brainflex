const express = require('express')
const router = express.Router()
const { signup, signin, googleAuth, me } = require('../controllers/authController')
const auth = require('../middleware/auth')

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/google', googleAuth) // 🆕 Added Google Auth endpoint
router.get('/me', auth, me)

module.exports = router