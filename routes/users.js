const express = require('express')
const bcrypt = require('bcrypt') // a package for hashing passwords
const router = express.Router()
const {User, validate} = require('../models/user')

router.post('/', async (req, res) => {
	const {error} = validate(req.body)
	if(error) return res.status(400).send(error.details[0].message)
	let {name, email, password} = req.body
	// make sure a user with this email is not registered already
	let user = await User.findOne({email})
	if(user) return res.status(400).send('User with this email is already registered')
	//hash the password before saving it to the database
	//a salt is a random string that is added before or after the password, so every time 
	// we hash the same password with a different salt, we get different result
	const salt = await bcrypt.genSalt(10)
	//reassign the password to a new hashed password
	password = await bcrypt.hash(password, salt)
	user = new User({name, email, password})
    await user.save()
    //generate jwt to eliminate the need to login after the registratio
    const token = user.generateAuthToken()
    //add it as a header and pick only certain properties from the object and send to the client
	// because we don't want to send the password back
    res.header('x-auth-token', token).json({name, email})
})

module.exports = router