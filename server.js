const express = require('express')
const helmet = require('helmet') // protects the app by adding http headers
const winston = require('winston') // a package for logging exceptions
const config = require('config')
const Joi = require('joi') //a package for data validation in Node/MongoDB applications
Joi.objectId = require('joi-objectid')(Joi) // adds id validation to Joi
const mongoose = require('mongoose')
const app = express()


const port = config.get('port')
const db = config.get('db')

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log(`connected to ${db} ...`))
	.catch(err => console.error(`could not connect to MongoDB: ${err}`))

//middleware
app.use(helmet())
app.use(express.static(__dirname + '/dist'))
app.use(express.json()) // to handle post and put requests
app.use(express.urlencoded({extended: true})) // if data is sent via form

//routes
app.get('/', (req, res) => {
  res.sendFile('index.html')
})
app.use('/api/todos', require('./routes/todos'))
app.use('/api/users', require('./routes/users'))

app.get('*', (req, res) => {
 	res.redirect('/')
})


const server = app.listen(port, () => console.log(`Listening on port ${port} ...`))
