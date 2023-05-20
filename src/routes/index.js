const express = require('express')
const router = express.Router()
const calendarRoute = require('./calendar.route')

router.use('/calendar', calendarRoute)

module.exports = router