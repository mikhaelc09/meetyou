const express = require('express')
const router = express.Router()
const calendarController = require('../controllers/calendar.controller')

router.get('/', calendarController.getCalendar)
router.post('/', calendarController.createCalendar)
router.put('/:id', calendarController.editCalendar)
router.delete('/:id', calendarController.deleteCalendar)
router.get('/next', calendarController.getNextEvent)

module.exports = router