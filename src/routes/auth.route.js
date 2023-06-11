const express = require('express')
const router = express.Router()
const userController = require('../controllers/auth.controller.js')
const auth = require("../middlewares/auth.middleware.js");

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)

module.exports = router