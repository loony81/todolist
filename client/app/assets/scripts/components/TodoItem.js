import React from 'react'

const TodoItem = ({todo, removeTodo, toggleCompletion}) => {
	
	return (
		<li className='task'><span 
			className={todo.completed && 'done'}
			onClick={()=>toggleCompletion(todo)}
			>{todo.name}
			</span>
			<span onClick={()=>removeTodo(todo)}> X </span>
		</li>		
	) 
}
export default TodoItem