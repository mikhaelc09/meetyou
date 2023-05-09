const jwt = require('jsonwebtoken');
const env = require('../config/env.config')

const generateToken = (duration, payload) => {
    return jwt.sign(
        {...payload},
        env('SECRET'),
        {
            expiresIn: duration
        }
    )
}

const verifyToken = (token) => {
    return jwt.verify(token, env('SECRET'), (err, data) => {
        if(err){
            return console.log("Token not verified")
        }
        const td = new Date()
        return console.log(`User ${data} logged in on ${td.toLocaleString()}`)
    })
}

module.exports = {
    generateToken,
    verifyToken
}