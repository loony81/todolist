//config a package for storing config setting in environment variables(can also use dotenv instead)
const config = require('config')

module.exports = () => {
	if(!config.get('jwtkey')) {
		//winston will hanlde this error and will terminate the current process
		throw new Error('FATAL ERROR: jwt private key is not defined.')
	}
}