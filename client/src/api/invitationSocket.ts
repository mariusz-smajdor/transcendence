import { getCookie } from '../views/game/game-cookies';

type InvitationHandler = (data: any) => void;

let socket: WebSocket | null = null;
const handlers: InvitationHandler[] = [];

export function connectInvitationSocket() {
	if (socket) return;

	socket = new WebSocket('ws://localhost:3000/invitations');

	socket.onopen = () => {
		const token = getCookie('access_token');
		socket?.send(JSON.stringify({ type: 'auth', token: token }));
		console.log('Invitation WebSocket opened');
	};

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		handlers.forEach((handler) => handler(data));
	};

	socket.onclose = () => {
		console.log('Invitation WebSocket closed');
		socket = null;
	};

	socket.onerror = (err) => {
		console.error('Invitation WebSocket error:', err);
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
