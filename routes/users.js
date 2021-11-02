const express = require('express')
const router = express.Router()
const {User, validateUser} = require('../models/user')

router.get('/', async (req, res) => {
	try{
		const users = await User.find().sort('name')
		res.json(users)
	} catch(err){
		res.json({message: err.message})
	}
	
})

module.exports = router