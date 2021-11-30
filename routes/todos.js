const express = require('express')
const router = express.Router()
const {Todo, validate} = require('../models/todo')
const {User} = require('../models/user')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
	// get user's id from jwt payload, find him in the database and get his todos
	const todos  = await User.findById(req.user._id).select('todos')
	res.json(todos)
})
 // this route is unnecessary but I included it for the sake of conformity with the REST api
router.get('/:id', auth, async (req, res) => {
	const user  = await User.findById(req.user._id).select('todos -_id')
	const todo = user.todos.id(req.params.id)
	if (!todo) return res.status(404).send({message: 'The todo with the given ID was not found.'})
  	res.json(todo)
})

router.post('/', auth, async (req, res) => {
	const {error} = validate(req.body)
	if(error) return res.status(400).send({message: error.details[0].message})
	const user  = await User.findById(req.user._id)
	const todo = new Todo({
		name: req.body.name,
		completed: req.body.completed
	})
	user.todos.push(todo)
	await user.save()
	res.status(201).json(user.todos)
})

router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body)
  if(error) return res.status(400).send({message: error.details[0].message})
  const user  = await User.findById(req.user._id)
  const todo = user.todos.id(req.params.id)
  if (!todo) return res.status(404).send({message: 'The todo with the given ID was not found.'})
  todo.name = req.body.name
  todo.completed = req.body.completed || todo.completed
  await user.save()
  
  res.status(201).json(todo)
})

router.delete('/:id', auth, async (req,res) => {
	const user  = await User.findById(req.user._id)
	const todo = user.todos.id(req.params.id)
	if (!todo) return res.status(404).send({message: 'The todo with the given ID was not found.'})
    const result = user.todos.pull(req.params.id)
	user.save()
	res.json(result)
})

module.exports = router