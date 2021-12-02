import React, {useContext} from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'
import {GlobalContext} from '../../context'
import TodoList from '../TodoList'
import Auth from '../Auth'

const AppRouter = () => {
	const {isAuthenticated} = useContext(GlobalContext) 
	return (
	<Switch>
		<Route path='/' exact><TodoList /></Route>
		{!isAuthenticated && <Route path='/auth' exact><Auth /></Route>}
		<Redirect to='/' />
	</Switch>	
	) 
}
export default AppRouter