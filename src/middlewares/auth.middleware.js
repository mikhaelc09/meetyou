const jwt = require('jsonwebtoken');
const env = require('../config/env.config.js');
const db = require('../models/index.js');

module.exports = {
    authToken: (req, res, next) => {
        if (req.headers["x-auth-token"]) {
            const token = req.headers["x-auth-token"];
            try {
                const decoded = jwt.verify(token, env("SECRET"));
                req.user = decoded;
                return next();
            }
            catch (err) {
                return res.status(401).json({ error: "Token Invalid" });
            }
        }
        return res.status(401).json({ error: "Unauthorized" });
    },

    checkZoomKey: async (req, res, next) => {
        const user = await db.User.findOne({
            where: { email: req.user.email }
        });
        if (user.zoom_key) {
            return next();
        }
        return res.status(401).json({ error: "Invalid Zoom Key, Please Update Your Zoom Key Using [PUT] /auth/zoom or follow this tutorial: " });
    },
}


