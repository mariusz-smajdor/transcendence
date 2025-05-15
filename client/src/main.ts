import { Router } from './router';
import { fetchMe } from './api/me';
import { getFriendRequest } from './api/friendRequest';

document.addEventListener('DOMContentLoaded', async () => {
	// do race all
	await fetchMe();
	await getFriendRequest();
	new Router();
});
