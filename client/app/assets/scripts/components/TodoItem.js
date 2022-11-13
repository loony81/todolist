import React from 'react'

const TodoItem = ({todo, removeTodo, toggleCompletion, provided}) => {
	
	return (
		<li className='task' {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
			<span 
				className={todo.completed && 'done'}
				onClick={()=>toggleCompletion(todo)}
			>{todo.name}
			</span>
			<span className='material-icons' onClick={()=>removeTodo(todo)}>delete</span>
		</li>		
	) 
}
export default TodoItem