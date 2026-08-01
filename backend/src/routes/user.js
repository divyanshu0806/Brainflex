const express = require('express')
const router = express.Router()
const { updateProfile, updatePassword, deleteAccount } = require('../controllers/userController')
const auth = require('../middleware/auth')

router.patch('/profile',  auth, updateProfile)
router.patch('/password', auth, updatePassword)
router.delete('/',        auth, deleteAccount)

module.exports = router