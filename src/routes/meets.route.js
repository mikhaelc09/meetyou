const express = require('express')
const router = express.Router()
const meetController = require('../controllers/meet.controller.js')
const auth = require("../middlewares/auth.middleware.js");
const hit = require("../middlewares/hit.middleware.js");
const { string } = require('joi');

router.post('/invite/:id', auth.authToken, meetController.inviteMeet)
router.get('/invite', auth.authToken, meetController.getInvite)
router.get('/invite/:id', auth.authToken, meetController.getInviteById)
router.put('/invite/:id', auth.authToken, meetController.responseInvite)
router.post('/', auth.authToken, auth.checkZoomKey, hit.checkLimit, meetController.createMeet)
router.get('/', auth.authToken, meetController.getMeet)
router.get(`/history`, auth.authToken, meetController.getHistoryMeet)
router.get('/:id', auth.authToken, meetController.getMeetById)

module.exports = router