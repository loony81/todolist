// this middleware function redirect all non secure requests to HTTPS

function isSecure(req) {
  if (req.headers['x-forwarded-proto']) {
    return req.headers['x-forwarded-proto'] === 'https'
  }
  return req.secure
}

module.exports = function(req, res, next){
	if (process.env.NODE_ENV === 'production' && !isSecure(req)) {
    	res.redirect(301, `https://${req.headers.host}${req.url}`)
  	} else {
    	next()
  	}
}