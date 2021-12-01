import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router} from 'react-router-dom'
import regeneratorRuntime from "regenerator-runtime"
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Auth from './components/Auth'

// for hot module replacement
if(module.hot) module.hot.accept() 



const App = () => {
	return (
	    <div>
	      <Router>
	    	<Header />
	        <Auth />
	        <Footer />
	      </Router>
	    </div>
    )
}


ReactDOM.render(<App />, document.querySelector('#root'))
