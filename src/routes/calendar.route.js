const express = require('express')
const router = express.Router()
const calendarController = require('../controllers/calendar.controller.js')
const auth = require('../middlewares/auth.middleware.js')

router.get('/', [auth.authToken, auth.checkGoogleKey],  calendarController.getCalendar)
router.post('/', [auth.authToken, auth.checkGoogleKey], calendarController.createCalendar)
router.put('/:id', [auth.authToken, auth.checkGoogleKey], calendarController.editCalendar)
router.delete('/:id', [auth.authToken, auth.checkGoogleKey], calendarController.deleteCalendar)

module.exports = router