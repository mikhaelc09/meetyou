const express = require('express')
const env = require('./config/env.config')
const routes = require('./routes/index')
const app = express()
const port = env('PORT')

app.use('/v1',routes)
app.get('/', (req, res) => res.send('Hello World!'))

app.get('/v1/auth/token', (req, res) => {
    return res.send('Hello World!')
})

app.listen(port, () => console.log(`listening on port ${port}!`))