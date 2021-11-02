const express = require('express')
const router = express.Router()
const {Todo, validateTodo} = require('../models/todo')

router.get('/', async (req, res) => {
	try{
		const todos = await Todo.find()
		res.json(todos)
	} catch(err){
		res.json({message: err.message})
	}
	
})

module.exports = router