const env = require('./env.config.js');

export default {
  development: {
    username: env('DB_USER'),
    password: env('DB_PASS'),
    database: env('DB_NAME'),
    host: env('DB_HOST'),
    dialect: env('DB_DIALECT')
  },
  test: {
    username: env('DB_USER'),
    password: env('DB_PASS'),
    database: env('DB_NAME'),
    host: env('DB_HOST'),
    dialect: env('DB_DIALECT')
  },
  production: {
    username: env('DB_USER'),
    password: env('DB_PASS'),
    database: env('DB_NAME'),
    host: env('DB_HOST'),
    dialect: env('DB_DIALECT')
  }
}