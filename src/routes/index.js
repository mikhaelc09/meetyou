const express = require('express')
const router = express.Router()
const calendarRoute = require('./calendar.route')
const userRoute = require('./users.route')
const meetRoute = require('./meets.route')

router.use('/calendar', calendarRoute)
router.use('/auth', userRoute)
router.use('/meet', meetRoute)

module.exports = router