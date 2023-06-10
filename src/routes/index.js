const express = require('express')
const router = express.Router()
const calendarRoute = require('./calendar.route')
const authRoute = require('./auth.route')
const meetRoute = require('./meets.route')

router.use('/calendar', calendarRoute)
router.use('/auth', authRoute)
router.use('/meet', meetRoute)

module.exports = router