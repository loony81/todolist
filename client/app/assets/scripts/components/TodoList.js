import React from 'react'
import TodoForm from './TodoForm'
import TodoItem from './TodoItem'

const TodoList = ({todos, addTodo, removeTodo, toggleCompletion}) => {
	
	//if todo has no _id, then name is used as key inside map
	console.log('TodoList is rendered')
	return (
		<>
			<TodoForm addTodo={addTodo} />
			<ul className='list'>
				{todos.map(todo => {
					return <TodoItem todo={todo} key={todo._id || todo.name} removeTodo={removeTodo} toggleCompletion={toggleCompletion} />
				})}
			</ul>
		</>
	) 
}
export default TodoList