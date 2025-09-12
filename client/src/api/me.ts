import { store } from '../store';
import { connectSocket } from '../socket';

export async function fetchMe(): Promise<boolean> {
	try {
		const res = await fetch('http://localhost:3000/api/users/me', {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) return false;

		store.setState({
			user: {
				id: data.id,
				username: data.username,
				email: data.email,
				avatar: data.avatar,
			},
		});
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}
