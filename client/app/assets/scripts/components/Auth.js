import React, {useState, useEffect, useContext} from 'react'
import {GlobalContext} from '../context'
import {authenticate} from '../utils/api'

const Auth = () => {
	const {isAuthenticated, setIsAuthenticated} = useContext(GlobalContext) 
	const [isRegistered, setIsRegistered] = useState(false)
	const [error, setError] = useState('')
	const [form, setForm] = useState({})
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if(error) setError('')
	}, [isRegistered])

	// each time a key is pressed inside one of the inputs, this function will run and update the form state
	const handleForm = e => {
		setForm({...form, [e.target.name]: e.target.value})
	}

	const handleSubmit = async e => {
		e.preventDefault() // prevent browser from reloading the page
		if(error) setError('')
		setLoading(true)
		const {email, password} = form
		//authenticate a user
		const result = await authenticate(isRegistered ? '/api/auth' : '/api/users', isRegistered ? {email, password} : {...form})
		setLoading(false)
		if(result.error){
			setError(result.error)
			return
		} 
		setIsAuthenticated(true)
		// clear the form
		setForm({
			name: '',
			email: '',
			password: ''
		})
	}

	return (
		<section className='auth'>
			{!isRegistered && <h2>Register and make your todos available across multiple devices</h2>}
			<form method='POST' onSubmit={handleSubmit}>
				{!isRegistered && <input type='text' name='name' value={form.name} onChange={handleForm} className='authInput' placeholder='Your name' required />}
				<input type='email' name='email' value={form.email} onChange={handleForm} className='authInput' placeholder='Your email' required />
				<input type='password' name='password' value={form.password} onChange={handleForm} className='authInput' placeholder='Your password' required />
				<p className='error'>{error}</p>
				{isRegistered ? <button disabled={loading ? true : false}>Login</button> : <button disabled={loading ? true : false}>Register</button>}
			</form>
			{!isRegistered && <p className='registered' onClick={()=> setIsRegistered(true)}>Already have an account?</p>}
		</section>
		
	) 
}
export default Auth