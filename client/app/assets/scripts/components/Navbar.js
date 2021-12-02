import React, {useContext} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {GlobalContext} from '../context'

const Navbar = () => {
	const {isAuthenticated, setIsAuthenticated} = useContext(GlobalContext)
	const location = useLocation()

	const handleLogout = e => {
		e.preventDefault()
		localStorage.removeItem('x-auth-token')
		setIsAuthenticated(false)
	}


	if(location.pathname === '/'){
		return (
			<>
				{!isAuthenticated && <Link to='/auth'>REGISTER</Link>}
				{isAuthenticated && <Link to='/' onClick={handleLogout}>LOGOUT</Link>}
			</>
		)
	}
	return (
		<>
			<Link to='/'>MY TODOS</Link>
			{isAuthenticated && <Link to='/' onClick={handleLogout}>LOGOUT</Link>}
		</>
	)
}
export default Navbar