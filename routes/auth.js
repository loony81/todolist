const express = require('express')
const bcrypt = require('bcrypt') // a package for hashing passwords
const Joi = require('joi')
const router = express.Router()
const {User} = require('../models/user')

//we only need to validate email and password so we won't use the validate function defined inside the User schema
// but instead define local validate function that will be used for logging in users
const validate = req => {
	const schema = {
		email: Joi.string().required().max(255).email({ minDomainAtoms: 2 }),
		password: Joi.string().required().min(6).max(255),
	}
	return Joi.validate(req, schema)
}

router.post('/', async (req, res) => {
	const {error} = validate(req.body)
	if(error) return res.status(400).send({message: error.details[0].message})
	let {email, password} = req.body
	// make sure we have a user with the given email in the database 
	let user = await User.findOne({email})
	//if there is no such user we don't want to tell the user why the authentication failed
	// so instead of sending a 404 response we will send a 400 error response to obscure the failure
	if(!user) return res.status(400).send({message: 'Invalid email or password'})
	//if a user with this email was found in the database, compare their password with the hashed password
	const validPassword = await bcrypt.compare(password, user.password)
	// and again if the comparison fails, send an obscure response
	if(!validPassword) return res.status(400).send({message: 'Invalid email or password'})
    //if everything's ok then generate a jwt token and send it to a user inside a header
    const token = user.generateAuthToken()
	res.header('x-auth-token', token).send({message: 'You have been successully logged in'})
})

module.exports = router