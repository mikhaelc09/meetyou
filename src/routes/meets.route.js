const express = require('express')
const router = express.Router()
const meetController = require('../controllers/meet.controller.js')
const auth = require("../middlewares/auth.middleware.js");

router.post('/', auth.authToken, auth.checkZoomKey, meetController.createMeet)
router.get('/', meetController.getMeetUser)
router.get('/:id', meetController.getMeetById)

module.exports = router