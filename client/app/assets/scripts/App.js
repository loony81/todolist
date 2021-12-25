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

// for hot module replacement
if(module.hot) module.hot.accept() 



const App = () => {

	const [isAuthenticated, setIsAuthenticated] = useState(false)

	//when the app is loaded for the first time or the page is just reloaded, 
	//we need to check if a user is still authenticated since the previous session
	// the jwt-check-expiration package allows to check if the jwt is expired or not
	// locally without sending a request to the server 
	useEffect(() => {
		const token = localStorage.getItem('x-auth-token')
		if(token){
			if(isJwtExpired(localStorage.getItem('x-auth-token'))) {
			} else setIsAuthenticated(true)
		}
	}, [])

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
