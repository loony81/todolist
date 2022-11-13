import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router} from 'react-router-dom'
import regeneratorRuntime from "regenerator-runtime"
import { isJwtExpired } from 'jwt-check-expiration'
import 'material-icons/iconfont/material-icons.css'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRouter from './components/routes/AppRouter'
// import context to be able to pass some state thru multiple components
import {GlobalContext} from './context'
import {
	getTodosFromLS,
	addTodoToLS,
	removeTodoFromLS,
	toggleCompletionInLS
} from './utils/ls'
import {
	makeRequest,
	syncTodos, 
	initialSync, 
	addTodoToServer, 
	removeTodoFromServer, 
	toggleCompletionOnServer,
	combineRemoteTodosAndLocalTodos
} from './utils/api'

// for hot module replacement
if(module.hot) module.hot.accept() 



const App = () => {
	const [todos, setTodos] = useState([])
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	useEffect(() => {
		//when the app is loaded for the first time or the page is just reloaded, 
		//we need to check if a user is still authenticated since the previous session
		// the jwt-check-expiration package allows to check if the jwt is expired or not
		// locally without sending a request to the server 
		const token = localStorage.getItem('x-auth-token')
		if(token){
			if(isJwtExpired(localStorage.getItem('x-auth-token'))) {
			} else setIsAuthenticated(true)
		}
		// pull todos from the local storage first
		const localTodos = getTodosFromLS()
		if(localTodos) {
			//get only those todo that are not flagged as deletedLocally
			const newTodos = localTodos.filter(todo => !todo.deletedLocally)
			newTodos.length && setTodos(newTodos)
		}
		// to synchronize authentication state in case more than one instance
		// of the app is opened in the browser
		window.addEventListener('storage', e => {
			if(e.key === 'x-auth-token'){
				if(e.newValue) setIsAuthenticated(true)
				else setIsAuthenticated(false)
			}
		})
	}, [])

	useEffect(() => {
		// and then if the user is logged in fetch todos from the server
		if(isAuthenticated) {
			(async () => {
				const todos = await initialSync()
				if(todos) setTodos(todos)
			})()
		}
	}, [isAuthenticated])

	


	const addTodo = async (name, completed=false) => {
		// allow to save a todo only if its length is within this range, and also if there is no todo with the same name already in LS
		name = name.trim()
		if(name.length >= 3 && name.length < 255){
			const localTodos = getTodosFromLS()
			const alreadyExists = localTodos && localTodos.find(todo => todo.name === name && !todo.deletedLocally)
			if(!alreadyExists){ // prevent adding duplicates
				if(isAuthenticated){
					//sync all todos before adding a new todo
					const failedToSync = await syncTodos()
					if(failedToSync.length === 0){
						//if there is nothing in failedToSync array, it means we can safely add a new todo
						const remoteTodos = await addTodoToServer(name, completed)
						if(remoteTodos.error){
							if(remoteTodos.error && remoteTodos.error === 'Invalid token') setIsAuthenticated(false)
							// if for whatever reason a todo wasn't added to remote storage
							// then save it only in local storage without an id
							addTodoToLS(name, completed)
							setTodos([...todos, {name, completed}])
						} else {
							const todos = combineRemoteTodosAndLocalTodos(remoteTodos)
							localStorage.setItem('todos', JSON.stringify(todos)) 
							setTodos(todos)
						}
					} else {
						// if failedToSync contains something, then don't add this todo to remote server
						// but keep it locally until next sync
						addTodoToLS(name, completed)
						setTodos([...todos, {name, completed}])
					}	
				} else {
					addTodoToLS(name, completed)
					setTodos([...todos, {name, completed}])
				}
			}
		}	
	}

	

	const removeTodo = async todo => {	
		let todos
		if(todo._id){
			if(isAuthenticated){
				//sync all todos before removing a todo
				const failedToSync = await syncTodos()
				if(failedToSync.length === 0){
					//if there is nothing in failedToSync array, it means we can safely remove a todo
					todos = await removeTodoFromServer(todo._id)
					if(todos.error) {
						if(todos.error === 'The todo with the given ID was not found.'){
							// if server returns 404 it means that it is no longer there (for example it was already deleted earlier from another device)
							// and we can safely delete it from LS
							todos = removeTodoFromLS(todo)
						} else {
							// if it failed to be deleted for other reasons then flag it as deletedLocally
							if(todos.error === 'Invalid token') setIsAuthenticated(false)
							todos = removeTodoFromLS(todo, true)
						}
					} else {
						todos = combineRemoteTodosAndLocalTodos(todos)
						localStorage.setItem('todos', JSON.stringify(todos)) 
					}
				} else {
					// if failedToSync contains something, then don't remove this todo from remote server
					// and keep it locally until next sync
					todos = removeTodoFromLS(todo, true)
				}	
			} else {
				// if user deletes a todo while being unauthenticated, then don't delete it from LS
				// but mark it as deletedLocally
				todos = removeTodoFromLS(todo, true)
			}
		} else {
			// if todo has no id it means it can be safely deleted from local storage
			// without going to remote storage and deleting it there
			todos = removeTodoFromLS(todo)	
		}
		//finally reset state
		setTodos(todos.filter(todo => !todo.deletedLocally))
	}

	const toggleCompletion = async todo => {
		let todos
		if(todo._id && isAuthenticated){
			//sync all todos before toggling comptetion
			const failedToSync = await syncTodos()
			if(failedToSync.length === 0){
				//if there is nothing in failedToSync array, it means we can safely toggle completion on remote server
				todos = await toggleCompletionOnServer(todo)
				if(todos.error) {
					if(todos.error === 'The todo with the given ID was not found.'){
						// if server returns 404 it means that todo is no longer there (for example it was already deleted earlier from another device)
						// and we can safely delete it from LS
						todos = removeTodoFromLS(todo)
					} else {
						// if it failed for other reasons then flag it as toggledLocally
						if(todos.error === 'Invalid token') setIsAuthenticated(false)
						todos = toggleCompletionInLS(todo)
					}
				} else {
					todos = combineRemoteTodosAndLocalTodos(todos)
					localStorage.setItem('todos', JSON.stringify(todos)) 
				}
			} else {
				// if failedToSync contains something, then don't make a request
				// and mark it as toggledLocally until next sync
				todos = toggleCompletionInLS(todo)
			}
		} else {
			// if todo has no id or user is unauthenticated then we can't make a request to the server 
			// and just mark todo as toggledLocally
			todos = toggleCompletionInLS(todo)
		}
		//finally reset state
		setTodos(todos)
	}

	const handleOnDragEnd = result => {
		if(!result.destination) return
		const newTodos = Array.from(todos)
	    //reorder all todos before saving them in localStorage
		const [reorderedTodo] = newTodos.splice(result.source.index, 1)	
		newTodos.splice(result.destination.index, 0, reorderedTodo)
		localStorage.setItem('todos', JSON.stringify(newTodos))
		setTodos(newTodos)	
		// console.log(result)
	}

	

	const methods = {
		addTodo,
		removeTodo,
		toggleCompletion,
		handleOnDragEnd
	}

	return (
	    <div className='container'>
	      <Router>
	      	<GlobalContext.Provider value={{isAuthenticated, setIsAuthenticated}} >
		    	<Header />
		        <AppRouter todos={todos} methods={methods} />
		        <Footer />
	        </GlobalContext.Provider>
	      </Router>
	    </div>
    )
}


ReactDOM.render(<App />, document.querySelector('#root'))
