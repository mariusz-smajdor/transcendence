import { getFriendRequests, getFriends } from './api/friendRequest';
import { connectInvitationSocket } from './api/invitationSocket';
import { fetchMe } from './api/me';
import { Router } from './router';
import { initI18n } from './services/i18n';
import { notificationService } from './services/notificationService';

document.addEventListener('DOMContentLoaded', async () => {
	// Initialize i18n translation handling
	initI18n();
	// Check for OAuth redirect parameters
	const urlParams = new URLSearchParams(window.location.search);
	const oauthStatus = urlParams.get('oauth');
	await connectInvitationSocket();

	if (oauthStatus === 'success') {
		// OAuth login successful, fetch user data
		const isValidToken = await fetchMe();
		if (isValidToken) {
			// Store OAuth status in localStorage
			localStorage.setItem('isOAuthUser', 'true');
			await getFriends();
			await getFriendRequests();
			await notificationService.connect();
		}

		// Clean up URL parameters
		window.history.replaceState({}, document.title, window.location.pathname);
	} else if (oauthStatus === 'error') {
		// OAuth login failed, show error message
		console.error('OAuth login failed');
		// Clean up URL parameters
		window.history.replaceState({}, document.title, window.location.pathname);
	} else if (document.cookie.includes('access_token')) {
		// Regular token-based authentication - validate token first
		const isValidToken = await fetchMe();
		if (isValidToken) {
			await getFriends();
			await getFriendRequests();
			await notificationService.connect();
		}
	}

	new Router();
});
