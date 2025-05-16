import { Router } from './router';
import { fetchMe } from './api/me';
import { getFriendRequest, getFriends } from './api/friendRequest';

document.addEventListener('DOMContentLoaded', async () => {
	// do race all
	await fetchMe();
	await getFriends();
	await getFriendRequest();
	new Router();
});
