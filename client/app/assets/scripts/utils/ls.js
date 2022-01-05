// the following functions manage todos in local storage

// returns all todos from local storage
export function getTodosFromLS(){
	const todos = localStorage.getItem('todos')
	if(todos) return JSON.parse(todos)
	return null
}

// this function adds one todo to local storage
export function addTodoToLS(name, completed){
	let localTodos = getTodosFromLS()
	if(localTodos){
		// if todos already exists in local storage, add new todo to it and rewrite it
		localTodos.push({name, completed})
		localStorage.setItem('todos', JSON.stringify(localTodos))
	} else {
		// if there is nothing yet, create it
		localTodos = [{name, completed}]
		localStorage.setItem('todos', JSON.stringify(localTodos))
	}
}

// this function removes one todo from local storage
export function removeTodoFromLS(todo, deletedLocally=false){
	let index
	const localTodos = getTodosFromLS()
	if(todo._id){
		index = localTodos.findIndex(t => t._id === todo._id)
	} else {
		index = localTodos.findIndex(t => t.name === todo.name)
	}
	
	if(deletedLocally){
		// we don't want to delete todo completely but add another property to it
		localTodos[index].deletedLocally = true
	} else {
		// remove it completely
		localTodos.splice(index,1)
	}
	localStorage.setItem('todos', JSON.stringify(localTodos))
	return localTodos
}

export function toggleCompletionInLS(todo){
	let index
	const localTodos = getTodosFromLS()
	if(todo._id){
		index = localTodos.findIndex(t => t._id === todo._id)
	} else {
		index = localTodos.findIndex(t => t.name === todo.name)
	}
	localTodos[index].completed = !todo.completed
	localTodos[index].toggledLocally = true
	localStorage.setItem('todos', JSON.stringify(localTodos))
	return localTodos.filter(todo => !todo.deletedLocally)
}