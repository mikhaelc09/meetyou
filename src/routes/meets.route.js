const express = require('express')
const router = express.Router()
const meetController = require('../controllers/meet.controller.js')

router.get('/', meetController.getMeetUser)
router.get('/:id', meetController.getMeetById)

module.exports = router