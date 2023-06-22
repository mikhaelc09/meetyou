const express = require('express')
const router = express.Router()
const accountController = require('../controllers/account.controller.js')
const auth = require("../middlewares/auth.middleware.js");
const multer = require("multer");

const upload = multer({
    dest: "./src/uploads",
    fileFilter: function (req, file, cb) {
        if (file.mimetype != "image/png") {
            return cb(new Error("Wrong file type"));
        }
        cb(null, true);
    },
    limits: { fileSize: 1000000 },
});

router.put('/password/', auth.authToken, accountController.updatePassword)
router.put('/top-up/', auth.authToken, accountController.topUpBalance)
router.put('/upgrade/', auth.authToken, accountController.upgradeTier)
router.put('/picture', auth.authToken, upload.single("picture"), accountController.updatePicture)
router.put('/zoom/', auth.authToken, accountController.updateZoomKey)
router.get('/', auth.authToken, accountController.getProfile)
router.get('/zoom', auth.authToken, accountController.getToken)
router.get('/zoom/redirect', accountController.redirectToken)

module.exports = router