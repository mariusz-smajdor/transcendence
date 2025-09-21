import { Router } from './router';
import { fetchMe } from './api/me';
import { getFriendRequest, getFriends } from './api/friendRequest';
import { connectInvitationSocket } from './api/invitationSocket';

document.addEventListener('DOMContentLoaded', async () => {
	// do race all
	await fetchMe();
	await getFriends();
	await getFriendRequest();
	connectInvitationSocket();
	new Router();
});
