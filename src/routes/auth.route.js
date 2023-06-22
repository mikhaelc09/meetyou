const express = require('express')
const router = express.Router()
const userController = require('../controllers/auth.controller.js')
const auth = require("../middlewares/auth.middleware.js");

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.post('/auth_google', auth.authToken, userController.oauth2)
router.get('/auth_google_get_code', userController.google)
router.get('/auth_callback', auth.authToken, userController.oauth2callback)

module.exports = router