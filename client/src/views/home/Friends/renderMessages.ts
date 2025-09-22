import { Wrapper } from '../../../components/wrapper';
import { Text } from '../../../components/text';
import { store } from '../../../store';

export function renderMessages(
	chat: HTMLElement,
	_friendId: number,
	messages: any[] = []
) {
	const { user } = store.getState();

	console.log('renderMessages called with:', { messages, user: user?.id });
	chat.innerHTML = '';

	if (messages.length === 0) {
		console.log('No messages, showing empty state');
		const noMessages = Text({
			content: 'No messages yet. Start the conversation!',
			classes: ['text-muted', 'text-center', 'py-8'],
		});
		chat.appendChild(noMessages);
		return;
	}

	messages.forEach((message, index) => {
		console.log(`Rendering message ${index}:`, message);
		const isOwnMessage = message.sender === user?.id;
		const styles = isOwnMessage
			? ['bg-primary/50', 'ml-auto']
			: ['bg-accent/50'];

		const messageEl = Wrapper({
			classes: [
				'flex',
				'items-center',
				'gap-2',
				'py-2',
				'px-3',
				'rounded',
				'w-fit',
				'max-w-xs',
				...styles,
			],
		});

		const messageContent = Text({
			content: message.message,
			classes: ['text-sm', 'break-words'],
		});

		messageEl.appendChild(messageContent);
		chat.appendChild(messageEl);
		console.log('Message element added to chat');
	});

	// Scroll to bottom
	chat.scrollTop = chat.scrollHeight;
}
