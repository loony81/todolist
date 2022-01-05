const Joi = require('joi')
const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema({
	name: {
		type: String, 
		required: 'Name cannot be blank!',
		trim: true
	},
	completed: {
		type: Boolean,
    	default: false
	},
	createdDate: {
		type: Date,
		default: Date.now
	}
})

const Todo = mongoose.model('Todo', todoSchema)

const validateTodo = todo => {
	const schema = {
		name: Joi.string().required().min(3).max(60),
		completed: Joi.boolean(),
		createdDate: Joi.date()
	}
	return Joi.validate(todo, schema)
}

module.exports.todoSchema = todoSchema
module.exports.Todo = Todo
module.exports.validate = validateTodo