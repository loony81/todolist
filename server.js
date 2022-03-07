const express = require('express')
const winston = require('winston') // a package for logging exceptions
const config = require('config')
const Joi = require('joi') //a package for data validation in Node/MongoDB applications
Joi.objectId = require('joi-objectid')(Joi) // adds id validation to Joi
const app = express()

require('./startup/logging')() // handling and logging errors
require('./startup/config')() //  configuration settings
require('./startup/db')() // db related logic


const port = config.get('port')

//middleware
app.use(express.static(__dirname + '/dist'))
app.use(express.json()) // to handle post and put requests
app.use(express.urlencoded({extended: true})) // if data is sent via form

//routes
app.get('/', (req, res) => {
  res.sendFile('index.html')
})
app.use('/api/todos', require('./routes/todos'))
app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))

app.get('*', (req, res) => {
 	res.redirect('/')
})

//error handling middleware must be registered after all the other middlewares and routes
app.use(require('./middleware/error')) 


const server = app.listen(port, () => winston.info(`Listening on port ${port} ...`))
