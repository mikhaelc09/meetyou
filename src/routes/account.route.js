const express = require('express')
const router = express.Router()
const accountController = require('../controllers/account.controller.js')
const auth = require("../middlewares/auth.middleware.js");

router.put('/password/', auth.authToken, accountController.updatePassword)
router.put('/zoom/', auth.authToken, accountController.updateZoomKey)
router.get('/', auth.authToken, accountController.getProfile)

module.exports = router