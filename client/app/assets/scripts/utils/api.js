export async function authenticate(url, body){
	const payload = {
		method: 'POST', 
		headers: new Headers({'Content-Type': 'application/json'}),
		body: JSON.stringify(body)
	}

	return fetch(url, payload)
		.then(response => {
			if(!response.ok){
				return response.json().then(data => {
					throw new Error(data.message)
				})
			} else {
				// extract the token from headers and save it in localStorage
				const token = response.headers.get('x-auth-token')
				if(!token) throw new Error('Something went wrong, try again later')
				localStorage.setItem('x-auth-token', token)
				return response.json()
			}
		})
		.catch(err => ({error: err.message}))
}

export async function makeRequest(url, method = 'GET', body = null){
	const headers = new Headers({'x-auth-token': localStorage.getItem('x-auth-token'), 'Content-Type': 'application/json'})
	let payload = method !== 'GET' ? 
		{
			method, 
			headers,
			body: JSON.stringify(body)
		} : {
			method,
			headers
		}

	return fetch(url, payload)
		.then(response => {
			if(!response.ok){
				return response.json().then(data => {
					throw new Error(data.message)
				})
			} 
			return response.json()
		})
		.catch(err => ({error: err.message}))
}
