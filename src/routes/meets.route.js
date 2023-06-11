const express = require('express')
const router = express.Router()
const meetController = require('../controllers/meet.controller.js')
const auth = require("../middlewares/auth.middleware.js");

router.post('/', auth.authToken, auth.checkZoomKey, meetController.createMeet)
router.get('/', auth.authToken, meetController.getMeet)
router.get('/:id', auth.authToken, meetController.getMeetById)
router.post('/:id/invite', auth.authToken, meetController.inviteMeet)

module.exports = router