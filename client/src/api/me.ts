import { store } from '../store';

export async function fetchMe() {
	try {
		const res = await fetch('http://localhost:3000/me', {
			method: 'GET',
			credentials: 'include',
		});

		if (!res.ok) {
			throw new Error(`HTTP error! Status: ${res.status}`);
		}

		const data = await res.json();

		if (data.success) {
			store.setState({
				user: {
					username: data.username,
					email: data.email,
					id: data.id,
					avatar: data.avatar,
				},
			});
		} else {
			throw new Error(data.message || 'Unknown error');
		}
	} catch (err) {
		console.error('Failed to fetch user:', err);
	}
}
