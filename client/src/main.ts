import { getFriendRequests, getFriends } from './api/friendRequest';
import { fetchMe } from './api/me';
import { Router } from './router';
import { notificationService } from './services/notificationService';

document.addEventListener('DOMContentLoaded', async () => {
	if (document.cookie.includes('access_token')) {
		await fetchMe();
		await getFriends();
		await getFriendRequests();

		// Initialize notification service
		notificationService.connect();
	}
	new Router();
});
