const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller.js')

router.get('/register', userController.registerUser)
router.get('/login', userController.loginUser)

module.exports = router