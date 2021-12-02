import React from 'react'
import Navbar from './Navbar'

const Header = () => {
	return (
		<header>
			<Navbar />
			<h1>todo<span>list</span></h1>
			<h2>A simple todo list app built using MERN stack</h2>
		</header>
	) 
}
export default Header