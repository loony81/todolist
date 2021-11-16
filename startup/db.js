const config = require('config')
const mongoose = require('mongoose')
const winston = require('winston')

module.exports = () => {
	const db = config.get('db')
	// no need to catch an unhandled rejection in case the db is unreachable, winston will handle it for us
	mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(() => winston.info(`connected to ${db} ...`))
}