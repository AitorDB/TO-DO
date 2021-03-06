import express from 'express'
import { Nuxt, Builder } from 'nuxt'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

import routes from './routes'

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(helmet())

// Import API Routes
app.use('/', routes)

// Express error handler
app.use((error, req, res, next) => {
  res
    .status(error.status ? error.status : 500)
    .send({
      status: error.status ? error.status : 500,
      message: error.status ? error.message : 'Internal Server Error'
    })
})

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)

// Start the server
mongoose.connect('mongodb://localhost/todoapp')
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port)
