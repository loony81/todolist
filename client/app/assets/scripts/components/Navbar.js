import React, {useContext} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {GlobalContext} from '../context'

const Navbar = () => {
	const {isAuthenticated, setIsAuthenticated} = useContext(GlobalContext)
	const location = useLocation()

	const handleLogout = e => {
		localStorage.removeItem('x-auth-token')
		setIsAuthenticated(false)
	}


	if(location.pathname === '/'){
		return (
			<>
				{!isAuthenticated && <Link to='/auth'>login</Link>}
				{isAuthenticated && <Link to='/' onClick={handleLogout}>logout</Link>}
			</>
		)
	}
	return (
		<>
			<Link to='/'>my todos</Link>
			{isAuthenticated && <Link to='/' onClick={handleLogout}>logout</Link>}
		</>
	)
}
export default Navbar