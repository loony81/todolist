import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import TodoList from './components/TodoList'
import Auth from './components/Auth'

// for hot module replacement
if(module.hot) module.hot.accept() 



const App = () => {
	return (
	    <div className="App">
	    	<Header />
	        <TodoList />
	        <Footer />
	    </div>
    )
}


ReactDOM.render(<App />, document.querySelector('#root'))
