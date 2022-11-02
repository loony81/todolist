import React from 'react'
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import TodoForm from './TodoForm'
import TodoItem from './TodoItem'

const TodoList = ({todos, addTodo, removeTodo, toggleCompletion, handleOnDragEnd}) => {
	
	//if todo has no _id, then name is used as key inside map

	return (
		<>
			<TodoForm addTodo={addTodo} />
			<DragDropContext onDragEnd={handleOnDragEnd}>
			<Droppable droppableId='dropzone'>
			{(provided) =>(
				<ul className='list' {...provided.droppableProps} ref={provided.innerRef}>
					{todos.map((todo, index) => {
						return (
							<Draggable key={todo._id || todo.name} draggableId={todo._id || todo.name} index={index}>
							{(provided)=>(
								<TodoItem todo={todo} removeTodo={removeTodo} toggleCompletion={toggleCompletion} provided={provided}/>
							)}
							</Draggable>
						)
					})}
				</ul>
			)}
			</Droppable>
			</DragDropContext>
		</>
	) 
}
export default TodoList