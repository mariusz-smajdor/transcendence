import { X } from 'lucide';
import { Card } from '../../../components/card';
import { Wrapper } from '../../../components/wrapper';
import { Text } from '../../../components/text';
import { Img } from '../../../components/img';
import { Icon } from '../../../components/icon';
import { Input } from '../../../components/input';
import { Button } from '../../../components/button';
import { sendMessage, getMessages } from '../../../api/messages';
import { type User } from '../../../types/user';
import { renderMessages } from './renderMessages';
import { dataChangeEmitter } from '../../../services/notificationService';

export const chat = Wrapper({
	classes: ['flex', 'flex-col', 'gap-2', 'h-72', 'overflow-y-auto'],
});

export function MessageCard(friend: User | null) {
	if (!friend) return null;

	let messages: any[] = [];

	const card = Card({
		classes: [
			'flex',
			'flex-col',
			'gap-2',
			'absolute',
			'bottom-4',
			'right-4',
			'lg:bottom-6',
			'lg:right-6',
			'max-w-80',
			'w-full',
			'shadow-lg',
			'shadow-background',
			'z-50',
		],
	});
	card.dataset.chatter = friend.id.toString();
	card.classList.remove('lg:p-6');
	const menu = Wrapper({
		classes: [
			'flex',
			'items-center',
			'justify-between',
			'gap-4',
			'pb-2',
			'border-b',
			'border-accent',
		],
	});
	const friendEl = Wrapper({
		classes: ['flex', 'items-center', 'gap-4'],
	});
	const img = Img({
		src: friend.avatar
			? `http://localhost:3000${friend.avatar}`
			: `https://ui-avatars.com/api/?length=1&name=${friend.username}&background=random`,
		alt: 'friend',
		classes: ['w-8', 'h-8', 'rounded-full'],
	});
	const name = Text({
		content: friend.username,
		classes: ['text-sm', 'font-semibold'],
	});
	const closeTrigger = Icon({
		icon: X,
		classes: [
			'text-muted',
			'transition-colors',
			'duration-300',
			'hover:text-secondary',
			'cursor-pointer',
		],
	});

	const messageForm = Wrapper({
		element: 'form',
		method: 'POST',
		classes: [
			'flex',
			'gap-2',
			'items-center',
			'pt-2',
			'border-t',
			'border-accent',
		],
	});
	const input = Input({
		name: 'message',
		type: 'text',
		placeholder: 'Type a message...',
		classes: ['px-2', 'py-1.5', 'text-sm', 'bg-background'],
	});
	input.classList.remove('px-3', 'py-2');
	const sendButton = Button({
		type: 'submit',
		variant: 'primary',
		content: 'Send',
		classes: ['px-2', 'py-1.5', 'text-sm'],
	});
	sendButton.classList.remove('px-3', 'py-2');

	async function loadMessages() {
		try {
			messages = await getMessages(friend.id);
			renderMessages(chat, friend.id, messages);
		} catch (error) {
			console.error('Failed to load messages:', error);
		}
	}

	closeTrigger.addEventListener('click', () => {
		card.remove();
	});

	messageForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		const message = input.value.trim();
		if (!message || !friend) return;

		try {
			await sendMessage(friend.id, message);
			// Reload messages to show the new one
			await loadMessages();
			input.value = '';
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	});

	// Listen for message updates
	dataChangeEmitter.on('messagesUpdated', loadMessages);

	friendEl.appendChild(img);
	friendEl.appendChild(name);
	menu.appendChild(friendEl);
	menu.appendChild(closeTrigger);
	messageForm.appendChild(input);
	messageForm.appendChild(sendButton);
	card.appendChild(menu);
	card.appendChild(chat);
	card.appendChild(messageForm);

	// Load messages after the chat element is added to the DOM
	loadMessages();

	return card;
}
