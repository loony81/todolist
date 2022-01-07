import React, {useState} from 'react'

const TodoForm = ({addTodo}) => {
	const[inputValue, setInputValue] = useState('')

	const handleInput = e => {
		e.target.value.length < 101 && setInputValue(e.target.value)
	}

	const handleSubmit = e => {
		if(e.which === 13 && inputValue.length > 2) {
			addTodo(inputValue)
			setInputValue('')
		}
	}

	return (
		<section className='form'>
			<input 
				type='text' 
				id='todoInput' 
				value={inputValue} 
				onChange={handleInput}
				onKeyPress={handleSubmit}
				placeholder='insert your task here ...' 
				maxlength='100'
			/>
		</section>
		
	) 
}
export default TodoForm