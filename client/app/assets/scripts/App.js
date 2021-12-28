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
		getTodosFromLS()
		
	}, [])

	useEffect(() => {
		// and then if the user is logged in fetch todos from the server
		isAuthenticated && loadTodosFromServer()
	}, [isAuthenticated])

	const getTodosFromLS = () => {
		let todos = localStorage.getItem('todos')
		if(todos){
			console.log(todos)
			todos = JSON.parse(todos)
			setTodos(todos)
		} 
	}

	const loadTodosFromServer = async () => {
		const remoteTodos = await makeRequest('/api/todos')
		if(remoteTodos.error) console.log(remoteTodos.error)
		else {
			// now we need to sync remote todos with local todos
		}
	}
	console.log('App is rendered')
	return (
	    <div>
	      <Router>
	      	<GlobalContext.Provider value={{isAuthenticated, setIsAuthenticated}} >
		    	<Header />
		        <AppRouter />
		        <Footer />
	        </GlobalContext.Provider>
	      </Router>
	    </div>
    )
}


ReactDOM.render(<App />, document.querySelector('#root'))
