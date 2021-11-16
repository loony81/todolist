const winston = require('winston')

module.exports = (err,req,res,next) => {
	// log the error before sending it to the client
	winston.error(err.message, err) // the second argument is the metadata about the error
	res.status(500).send('Something went wrong: ' + err.message)
}