const dotenv = require('dotenv');
dotenv.config()

env_map = {
    PORT: process.env.PORT ?? 3000,
    SECRET: process.env.SECRET ?? 'mbokmu',
    ITEMPERPAGE: process.env.ITEMPERPAGE ?? 10,
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_NAME: process.env.DB_NAME ?? 'meetyou_db',
    DB_USER: process.env.DB_USER ?? 'root',
    DB_PASS: process.env.DB_PASS ?? '',
    DB_DIALECT: process.env.DB_DIALECT ?? 'mysql',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "" ,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "" ,
    GOOGLE_AUTH_REDIRECT_URL: process.env.GOOGLE_AUTH_REDIRECT_URL ?? "" ,
}

module.exports = env = (key) => {
    return env_map[key]
}