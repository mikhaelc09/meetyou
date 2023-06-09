const express = require('express')
const router = express.Router()
const meetController = require('../controllers/meet.controller.js')

router.get('/meet', meetController.getMeetUser)

module.exports = router