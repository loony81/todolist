import React from 'react'
import ReactDOM from 'react-dom'
import './App.css'

// for hot module replacement
if(module.hot) module.hot.accept() 



const App = () => {
	return (
	    <div className="App">
	        
	    </div>
    )
}


ReactDOM.render(<App />, document.querySelector('#root'))
