const express = require('express')
const helmet = require('helmet') // protects the app by adding http headers
const winston = require('winston') // a package for logging exceptions
const Joi = require('joi') //a package for data validation in Node/MongoDB applications
Joi.objectId = require('joi-objectid')(Joi) // adds id validation to Joi
const app = express()


const port = process.env.PORT || 5000


//middleware
app.use(helmet())
app.use(express.static(__dirname + '/dist'))
app.use(express.json())


//routes
app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.get('*', (req, res) => {
 	res.redirect('/')
})


const server = app.listen(port, () => console.log(`Listening on port ${port} ...`))
