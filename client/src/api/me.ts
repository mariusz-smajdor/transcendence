import { store } from '../store';
import { deleteCookie } from '../views/game/game-cookies';

export async function fetchMe(): Promise<boolean> {
	try {
		const res = await fetch(`/api/me`, {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok) {
			// Clear access token cookie when authentication fails
			deleteCookie('access_token');
			// Clear user state when authentication fails
			store.setState({ user: null });
			return false;
		}

		store.setState({ user: data.payload });

		return true;
	} catch (error) {
		console.log(error);
		// Clear access token cookie when there's an error
		deleteCookie('access_token');
		// Clear user state when there's an error
		store.setState({ user: null });
		return false;
	}
}
