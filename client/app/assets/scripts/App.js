import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router} from 'react-router-dom'
import regeneratorRuntime from "regenerator-runtime"
import { isJwtExpired } from 'jwt-check-expiration'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import AppRouter from './components/routes/AppRouter'
// import context to be able to pass some state thru multiple components
import {GlobalContext} from './context'
import {makeRequest} from './utils/api'

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
			//get only those todo that haven't been deleted when a user wasn't logged in
			const newTodos = localTodos.filter(todo => !todo.deleted)
			newTodos.length && setTodos(newTodos)
		}
		console.log('App is mounted')
	}, [])

	useEffect(() => {
		// and then if the user is logged in fetch todos from the server
		isAuthenticated && syncTodos()
	}, [isAuthenticated])

	const getTodosFromLS = () => {
		const todos = localStorage.getItem('todos')
		if(todos) return JSON.parse(todos)
		return null
	}

	const loadAllTodosFromServer = async () => {
		const remoteTodos = await makeRequest('/api/todos')
		if(remoteTodos.error) return console.log(remoteTodos.error)
		return remoteTodos
	}

	const syncTodos = async remoteTodos => {
		let newTodos
		const localTodos = getTodosFromLS()
		if(localTodos){
			//first of all we need to filter out those todos from local storage
			// that were added to it when a user wasn't logged in, which means they don't have an id
			// and also they are still not flagged as deleted
			const todosWithoutId = localTodos.filter(todo => !todo._id && !todo.deleted)
			// add them to remote storage
			if(todosWithoutId.length) {
				for(let todo of todosWithoutId) {
					newTodos = await addTodoToServer(todo.name)
				}
			}
			// remove from remote storage all those todos which were deleted from local storage
			// when a user wasn't logged in 
			const deletedTodos = localTodos.filter(todo => todo.deleted)
			// remove them from remote storage
			if(deletedTodos.length) {
				for(let todo of deletedTodos){
					newTodos = await removeTodoFromServer(todo._id)
				}
			}
		}
		//removeTodoFromServer and addTodoToServer both return all todos from the remote server, 
		//so if newTodos contains something we can use it to reset both local storage and todos state
		if(!newTodos){
			//if newTodos is still a falsy value, it means we didn't make any requests to the server
			// but we still need to load remote todos because there might be todos added from another device
			newTodos = await loadAllTodosFromServer()
		}
		// if there is something in newTodos, then reset local storage and state
		if(newTodos.todos.length){
			localStorage.setItem('todos', JSON.stringify(newTodos.todos))
			setTodos(newTodos.todos)
		}
	}

	const addTodoToServer = async name => {
		
	}

	const removeTodoFromServer = async id => {
		
	}

	const toggleCompletionOnServer = (id, status) => {
		
	}

	console.log('App is rendered')
	return (
	    <div>
	      <Router>
	      	<GlobalContext.Provider value={{isAuthenticated, setIsAuthenticated}} >
		    	<Header />
		        <AppRouter todos={todos} />
		        <Footer />
	        </GlobalContext.Provider>
	      </Router>
	    </div>
    )
}


ReactDOM.render(<App />, document.querySelector('#root'))
