import { store } from './store';
import { renderMessages } from './views/home/Friends/renderMessages';
import { chat } from './views/home/Friends/MessageCard';

let socket: WebSocket | null = null;

type MessagePayload = {
	toUserId: string;
	message: string;
};

type MessageHandler = (data: any) => void;

const connectSocket = (onMessage?: MessageHandler) => {
	const { user, messages } = store.getState();

	if (!socket || socket.readyState === WebSocket.CLOSED) {
		socket = new WebSocket('ws://localhost:3000/message');

		socket.addEventListener('open', () => {
			console.log('WebSocket connection opened');
		});

		socket.addEventListener('message', (event) => {
			const data = JSON.parse(event.data);
			messages.push({
				sender: data.senderId,
				receiver: user?.id as number,
				message: data.message,
				read: false,
			});
			const currentChat = document.querySelector(
				'[data-chatter]'
			) as HTMLDivElement | null;
			console.log(currentChat?.dataset.chatter);
			if (currentChat?.dataset.chatter === data.senderId.toString()) {
				renderMessages(chat, data.senderId);
			} else {
				const senderMessageIcon = document.querySelector(
					'[data-chatter-id="' + data.senderId + '"]'
				)?.firstChild as HTMLElement | null;
				senderMessageIcon?.classList.add('glow-secondary-animate');
			}
			onMessage?.(data);
		});

		socket.addEventListener('close', () => {
			console.log('WebSocket connection closed');
		});

		socket.addEventListener('error', (err) => {
			console.error('WebSocket error:', err);
		});
	}
};

const sendMessage = (payload: MessagePayload) => {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(payload));
	} else {
		console.warn('WebSocket is not open.');
	}
};

export { connectSocket, sendMessage };
