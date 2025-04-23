import { Router } from './router';
import { store } from './state/store';
import { getCookie } from './utils/cookies';
const token = getCookie('access_token');
if (token) {
	store.setState({ accessToken: token });
}
document.addEventListener('DOMContentLoaded', () => {
	new Router();
});
