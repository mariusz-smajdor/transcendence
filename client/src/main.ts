import { getFriendRequests, getFriends } from './api/friendRequest';
import { fetchMe } from './api/me';
import { Router } from './router';
import { notificationService } from './services/notificationService';

document.addEventListener('DOMContentLoaded', async () => {
	// Check for OAuth redirect parameters
	const urlParams = new URLSearchParams(window.location.search);
	const oauthStatus = urlParams.get('oauth');

	if (oauthStatus === 'success') {
		// OAuth login successful, fetch user data
		await fetchMe();
		await getFriends();
		await getFriendRequests();
		notificationService.connect();

		// Clean up URL parameters
		window.history.replaceState({}, document.title, window.location.pathname);
	} else if (oauthStatus === 'error') {
		// OAuth login failed, show error message
		console.error('OAuth login failed');
		// Clean up URL parameters
		window.history.replaceState({}, document.title, window.location.pathname);
	} else if (document.cookie.includes('access_token')) {
		// Regular token-based authentication
		await fetchMe();
		await getFriends();
		await getFriendRequests();
		notificationService.connect();
	}

	new Router();
});
