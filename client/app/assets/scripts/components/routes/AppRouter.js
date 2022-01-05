import React, {useContext} from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'
import {GlobalContext} from '../../context'
import TodoList from '../TodoList'
import Auth from '../Auth'

const AppRouter = ({todos, methods}) => {
	const {isAuthenticated} = useContext(GlobalContext) 
	return (
	<Switch>
		<Route path='/' exact><TodoList todos={todos} {...methods} /></Route>
		{!isAuthenticated && <Route path='/auth' exact><Auth /></Route>}
		<Redirect to='/' />
	</Switch>	
	) 
}
export default AppRouter