const Joi = require('joi')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('config')
const {todoSchema} = require('./todo')


const userSchema = new mongoose.Schema({
	name: {
		type: String, 
		required: true,
		minlength: 3,
		maxlength: 50
	},
	email: {
		type: String,
    	required: true,
    	maxlength: 255,
    	unique: true // to ensure there are no two users with the same email
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		maxlength: 1024 // for hashed password
	},
	//todo schema will be embedded inside user schema. 
	//A user can have many todos, but a todo belongs to only one user
	todos: [
		{
			type: todoSchema,
			required: true
		}
	] 
})

userSchema.methods.generateAuthToken = function(){
	return jwt.sign({_id: this._id}, config.get('jwtkey'), {expiresIn: '7d'})
}

const User = mongoose.model('User', userSchema)

const validateUser = user => {
	const schema = {
		name: Joi.string().alphanum().required().min(3).max(50),
		email: Joi.string().required().max(255).email({ minDomainAtoms: 2 }),
		password: Joi.string().required().min(6).max(255),
		todos: Joi.array().items(Joi.object())
	}
	return Joi.validate(user, schema)
}

module.exports.User = User
module.exports.validate = validateUser
