import { store } from '../store';

export async function fetchMe(): Promise<boolean> {
	try {
		const res = await fetch(`http://localhost:3000/me`, {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok) return false;

		store.setState({ user: data.payload });

		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}
