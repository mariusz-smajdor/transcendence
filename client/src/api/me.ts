import { store } from '../store';

export async function fetchMe(): Promise<boolean> {
	try {
		const res = await fetch(`/api/me`, {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok) {
			// Clear user state when authentication fails
			store.setState({ user: null });
			return false;
		}

		store.setState({ user: data.payload });

		return true;
	} catch (error) {
		console.log(error);
		// Clear user state when there's an error
		store.setState({ user: null });
		return false;
	}
}
