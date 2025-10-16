import { Wrapper } from '../../../components/wrapper';
import { Text } from '../../../components/text';
import { t } from '../../../services/i18n';
import { store } from '../../../store';

export function renderMessages(
	chat: HTMLElement,
	_friendId: number,
	messages: any[] = []
) {
	const { user } = store.getState();

	chat.innerHTML = '';

	if (messages.length === 0) {
		const noMessages = Text({
			content: t('messages.noMessages'),
			classes: ['text-muted', 'text-center', 'py-8'],
		});
		noMessages.setAttribute('data-i18n', 'messages.noMessages');
		chat.appendChild(noMessages);
		return;
	}

	messages.forEach((message) => {
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
	});

	// Scroll to bottom
	chat.scrollTop = chat.scrollHeight;
}
