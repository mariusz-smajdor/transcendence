import { getCookie } from '../views/game/game-cookies';
import { Toaster } from '../components/toaster';

type InvitationHandler = (data: any) => void;

let socket: WebSocket | null = null;
const handlers: InvitationHandler[] = [];

export async function connectInvitationSocket(): Promise<void> {
	if (socket) return;

	return new Promise((resolve, reject) => {
		// Always connect to get sessionId, even without valid token
		socket = new WebSocket('wss://10.12.4.4:8080/invitations');

		let sessionIdReceived = false;
		const timeout = setTimeout(() => {
			if (!sessionIdReceived) {
				console.warn('Session ID setup timeout - continuing anyway');
				resolve();
			}
		}, 5000); // 5 second timeout

		socket.onopen = () => {
			const token = getCookie('access_token');
			const sessionId = getCookie('sessionId');
			socket?.send(JSON.stringify({ type: 'auth', token, sessionId }));
			console.log('Invitation WebSocket opened');

			// If sessionId already exists, resolve immediately
			if (sessionId) {
				sessionIdReceived = true;
				clearTimeout(timeout);
				resolve();
			}
		};

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'cookies') {
				if (data.sessionId) {
					document.cookie = `sessionId=${data.sessionId}; path=/;`;
					console.log('Session ID received and set:', data.sessionId);
				}
				if (!data.token) {
					document.cookie = 'access_token=; path=/;';
				}
				// Resolve the promise once sessionId is set
				if (!sessionIdReceived) {
					sessionIdReceived = true;
					clearTimeout(timeout);
					resolve();
				}
				return;
			} else if (data.type === 'message') Toaster(data.message);
			handlers.forEach((handler) => handler(data));
		};

		socket.onclose = () => {
			console.log('Invitation WebSocket closed');
			socket = null;
		};

		socket.onerror = (err) => {
			console.error('Invitation WebSocket error:', err);
			socket = null;
			clearTimeout(timeout);
			reject(err);
		};
	});
}

export function onInvitation(handler: InvitationHandler) {
	// Prevent duplicate handlers
	if (handlers.includes(handler)) {
		console.warn(
			'Duplicate invitation handler detected, skipping registration'
		);
		return () => {}; // Return empty cleanup function
	}
	handlers.push(handler);
	return () => {
		const idx = handlers.indexOf(handler);
		if (idx !== -1) handlers.splice(idx, 1);
	};
}
export function sendInvitation(payload: any) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(payload));
	}
}
