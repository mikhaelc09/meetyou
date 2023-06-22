const jwt = require('jsonwebtoken');
const env = require('../config/env.config.js');
const db = require('../models/index.js');
const oauth2Client = require('../config/google_oauth.config.js');

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
        return res.status(401).json({ error: "Invalid Zoom Key, Please Update Your Zoom Key Using [PUT] /account/zoom or follow this tutorial: " });
    },

    checkGoogleKey: async (req, res, next) => {
        const user = await db.User.findOne({
            where: { email: req.user.email }
        });
        if (!user.google_code) {
            return res.status(401).json({ error: "No Google OAuth 2.0 Key, Please Login from [POST] /v1/auth/auth_google or follow this tutorial: " });
        }
        if(!oauth2Client.credentials.access_token){
            let tokens
            try{
                tokens = await oauth2Client.getToken(user.google_code)
            }
            catch(err){
                console.log(err)
                return res.status(400).json({ error: "No Google OAuth 2.0 Key, Please Login from [POST] /v1/auth/auth_google or follow this tutorial: " })
            }
            console.log(tokens)
            oauth2Client.setCredentials(tokens)
            return next();
        }
        return next();
    }
}


