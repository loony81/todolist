const express = require('express')
const router = express.Router()
const {Todo, validate} = require('../models/todo')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
	const todos = await Todo.find()
	res.json(todos)
})
 // this route is unnecessary but I included it for the sake of conformity with the REST api
router.get('/:id', auth, async (req, res) => {
	const todo = await Todo.findById(req.params.id)
	if (!todo) return res.status(404).send('The todo with the given ID was not found.')
  	res.json(todo)
})

router.post('/', auth, async (req, res) => {
	const {error} = validate(req.body)
	if(error) return res.status(400).send(error.details[0].message)
	const todo = new Todo({
		name: req.body.name,
		completed: req.body.completed
	})
	await todo.save()
	res.status(201).json(todo)
})

router.put('/:id', auth, async (req, res) => {
  const todo = await Todo.findById(req.params.id)
  if (!todo) return res.status(404).send('The todo with the given ID was not found.')
  const { error } = validate(req.body);
  if(error) return res.status(400).send(error.details[0].message)
  todo.name = req.body.name
  todo.completed = req.body.completed || todo.completed
  await todo.save()
  res.status(201).json(todo)
})

router.delete('/:id', auth, async (req,res) => {
	const result = await Todo.findByIdAndRemove(req.params.id)
	if (!result) return res.status(404).send('The todo with the given ID was not found.');
	res.json(result)
})

module.exports = router