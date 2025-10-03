import { getCookie } from '../views/game/game-cookies';
import { Toaster } from '../components/toaster';

type InvitationHandler = (data: any) => void;

async function validateToken(): Promise<boolean> {
	try {
		const res = await fetch(`/api/me`, {
			method: 'GET',
			credentials: 'include',
		});
		return res.ok;
	} catch (error) {
		console.error('Token validation error:', error);
		return false;
	}
}

let socket: WebSocket | null = null;
const handlers: InvitationHandler[] = [];

export async function connectInvitationSocket() {
	if (socket) return;

	// Validate token before connecting
	const isValidToken = await validateToken();
	if (!isValidToken) {
		console.log(
			'Token validation failed, skipping invitation WebSocket connection'
		);
		return;
	}

	socket = new WebSocket('wss://localhost:8080/invitations');

	socket.onopen = () => {
		const token = getCookie('access_token');
		const sessionId = getCookie('sessionId');
		//console.log(token,sessionId);
		socket?.send(JSON.stringify({ type: 'auth', token, sessionId }));
		console.log('Invitation WebSocket opened');
	};

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log(data);
		if (data.type === 'cookies') {
			if (data.token) {
				document.cookie = `sessionId=; path=/;`;
			} else {
				document.cookie = `sessionId=${data.sessionId}; path=/;`;
				document.cookie = 'token=; path=/;';
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
	};
}

export function onInvitation(handler: InvitationHandler) {
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
