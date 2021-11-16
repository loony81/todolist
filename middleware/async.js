// if express-async-errors package doesn't work, use this module instead
module.exports = handler => {
	return async (req,res,next) => {
		try {
			await handler(req,res)
		} catch(e) {
			next(e) // here we pass handling the exception to the error middleware
		}
	}
}