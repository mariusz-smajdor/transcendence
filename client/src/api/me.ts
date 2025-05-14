import { store } from '../store';

export async function fetchMe() {
	try {
		const res = await fetch('http://localhost:3000/me', {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) return;

		store.setState({
			user: {
				id: data.id,
				username: data.username,
				email: data.email,
				avatar: data.avatar,
			},
		});
	} catch (error) {
		console.log(error);
	}
}
