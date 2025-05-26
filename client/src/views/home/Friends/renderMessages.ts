import { Wrapper } from '../../../components/wrapper';
import { Text } from '../../../components/text';
import { store } from '../../../store';

export function renderMessages(chat: HTMLElement, friendId: number) {
	const { user, messages } = store.getState();

	chat.innerHTML = '';

	const friendMessages = messages.filter(
		(message) =>
			(message.sender === user?.id && message.receiver === friendId) ||
			(message.sender === friendId && message.receiver === user?.id)
	);

	friendMessages.forEach((message) => {
		const styles =
			message.sender === user?.id
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
				...styles,
			],
		});

		const messageContent = Text({
			content: message.message,
			classes: ['text-sm'],
		});
		chat.scrollTop = chat.scrollHeight;

		messageEl.appendChild(messageContent);
		chat.appendChild(messageEl);
	});
}
