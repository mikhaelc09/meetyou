const express = require('express')
const router = express.Router()
const calendarRoute = require('./calendar.route')
const userRoute = require('./users.route')

router.use('/calendar', calendarRoute)
router.use('/users', userRoute)

module.exports = router