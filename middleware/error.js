const winston = require('winston')

module.exports = (err,req,res,next) => {
	// log the error before sending it to the client
	winston.error(err.message)
	res.status(500).send({message: err.message})
}