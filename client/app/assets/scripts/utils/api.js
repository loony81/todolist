import {getTodosFromLS, removeTodoFromLS} from './ls'
const todosApi = '/api/todos/'

export async function authenticate(url, body){
	const payload = {
		method: 'POST', 
		headers: new Headers({'Content-Type': 'application/json'}),
		body: JSON.stringify(body)
	}

	return fetch(url, payload)
		.then(response => {
			if(!response.ok){
				return response.json().then(data => {
					throw new Error(data.message)
				})
			} else {
				// extract the token from headers and save it in localStorage
				const token = response.headers.get('x-auth-token')
				if(!token) throw new Error('Something went wrong, try again later')
				localStorage.setItem('x-auth-token', token)
				return response.json()
			}
		})
		.catch(err => ({error: err.message}))
}

// generic function for making any type of request to the server based on fetch
export async function makeRequest(url, method = 'GET', body = null){
	const headers = new Headers({'x-auth-token': localStorage.getItem('x-auth-token'), 'Content-Type': 'application/json'})
	let payload = method === 'POST' || method === 'PUT' ? 
		{
			method, 
			headers,
			body: JSON.stringify(body)
		} : {
			method,
			headers
		}

	return fetch(url, payload)
		.then(resp => {
			if(!resp.ok){
				return resp.json().then(data => {
					throw new Error(data.message)
				})
			} 
			return resp.json()
		})
		.catch(err => ({error: err.message}))
}

// self-explanatory
const loadAllTodosFromServer = async () => {
	const remoteTodos = await makeRequest(todosApi)
	if(remoteTodos.error) {
		console.log(remoteTodos.error)
		return null
	}
	return remoteTodos
}

// self-explanatory
export async function addTodoToServer(name, completed){
	const remoteTodos = await makeRequest(todosApi, 'POST', {name, completed})
	return remoteTodos
}

// self-explanatory
export async function removeTodoFromServer(id){
	const remoteTodos = await makeRequest(todosApi + id, 'DELETE')
	return remoteTodos
}

export async function toggleCompletionOnServer(todo){
	const {_id, name, completed} = todo
	const remoteTodos = await makeRequest(todosApi + _id, 'PUT', {name, completed: !completed})
	return remoteTodos
}

export async function initialSync(){
	const failedToSync = await syncTodos()
	const remoteTodos = await loadAllTodosFromServer()
	//if there is something in remoteTodos, then reset local storage
	// but keep those todos that haven't been synced until next time
	if(remoteTodos){
		if(remoteTodos.length !== 0){
			if(failedToSync.length === 0){
				const todos = combineRemoteTodosAndLocalTodos(remoteTodos)
				localStorage.setItem('todos', JSON.stringify(todos))
				return todos
			} else {
				const todos1 = combineRemoteTodosWithFailedTodos(remoteTodos, failedToSync)
				const todos2 = combineRemoteTodosAndLocalTodos(todos1)
				localStorage.setItem('todos', JSON.stringify(todos2))
				return todos
			}
		} else {
			if(failedToSync.length === 0){
				localStorage.setItem('todos', JSON.stringify([]))
				return []
			} else {
				return null
			}
		}		
	}
}

export function combineRemoteTodosAndLocalTodos(remoteTodos){
	const localTodos = getTodosFromLS()
	const result = [...localTodos]
	// go through local todos and remove those todos that are no longer present remotely (were deleted from another device)
	// but only if a local todo has an id, which means it was already registered remotely before
	localTodos.forEach((localTodo, i) => {
		if(localTodo._id){
			const present = remoteTodos.find(remoteTodo => localTodo._id === remoteTodo._id && localTodo.name === remoteTodo.name)
			if(!present) {
				const index = result.findIndex(todo => todo._id === localTodo._id)
				result.splice(index,1)
			}
		}
	})
	//go through remote todos and if there are todos that are not present locally, add them
	// and also sync data in those todos that present both locally and remotely
	for(let remoteTodo of remoteTodos){	
		const alreadyExists = localTodos.find(localTodo => localTodo.name === remoteTodo.name)
		if(!alreadyExists) result.push(remoteTodo)
		else {
			// if the local todo desn't have an id, get it from its remote counterpart
			if(!alreadyExists._id) {
				alreadyExists._id = remoteTodo._id
			}
			// if the 'completed' property doesn't match, set it equal to what it is on the remoteTodo
			if(alreadyExists.completed !== remoteTodo.completed){
				alreadyExists.completed = remoteTodo.completed
			}
		} 
	}
	return result
}


// this huge function synchronizes local todos with remote todos
export async function syncTodos(){
	const failedToSync = [] // to keep those todos which failed to sync
	const localTodos = getTodosFromLS()
	if(localTodos){
		//first of all remove from remote storage all those todos which were deleted from local storage
		// when a user wasn't logged in or was offline
		const deletedTodos = localTodos.filter(todo => todo.deletedLocally && todo._id)
		// remove them from remote storage
		if(deletedTodos.length) {
			for(let todo of deletedTodos){
				const remoteTodos = await removeTodoFromServer(todo._id)
				if(remoteTodos.error && remoteTodos.error !== 'The todo with the given ID was not found.'){
					// only add it to failedToSync array if the error is not a 404 error
					// a 404 error means the remote todo is no longer there (maybe it was deleted earler from another device)
					// so we don't need to add it to failedToSync array and can delete it from local storage
					failedToSync.push(todo)
				} else {
					//if a todo was successfully deleted on the server, completely delete it from local storage
					removeTodoFromLS(todo)
				}
			}
		}
		// then find all those todos which were marked as completed while a user wasn't logged in or was offline
		const completedTodos = localTodos.filter(todo => todo.toggledLocally && todo._id)
		// remove them from remote storage
		if(completedTodos.length) {
			for(let todo of completedTodos){
				const remoteTodos = await toggleCompletionOnServer({...todo, completed: !todo.completed})
				// if the error is 404 it means the remote todo is no longer there (maybe it was deleted earler from another device)
				// so we don't need to add it to failedToSync array and can delete it from local storage
				if(remoteTodos.error && remoteTodos.error !== 'The todo with the given ID was not found.'){
					// only add it to failedToSync array if the error is not a 404 error
					// a 404 error means the remote todo is no longer there (maybe it was deleted earler from another device)
					// so we don't need to add it to failedToSync array and can delete it from local storage
					failedToSync.push(todo)
				}
			}
		}
		//and finally filter out all those todos from local storage that were added to it
		// while a user wasn't logged in or was offline, which means they don't have an id
		const todosWithoutId = localTodos.filter(todo => !todo._id)
		// add them to remote storage
		if(todosWithoutId.length) {
			for(let todo of todosWithoutId) {
				const remoteTodos = await addTodoToServer(todo.name, todo.completed)
				// if adding a todo to remote storage failed, keep it in failedToSync array
				if(remoteTodos.error) failedToSync.push(todo)
			}
		}	
	}
	return failedToSync
}

// this function combines remote todos with those todos that failed to syncronize
// they will remain in local storage until later synchronization
const combineRemoteTodosWithFailedTodos = (remoteTodos, failedTodos) => {
	const result = []
	for(let remoteTodo of remoteTodos){	
		for(let failedTodo of failedTodos){
			if(remoteTodo._id === failedTodo._id){
				result.push(failedTodo)
			} else result.push(remoteTodo)
		}
	}
	for(let failedTodo of failedTodos){
		if(!result.includes(failedTodo)) result.push(failedTodo)
	}
	return result
}