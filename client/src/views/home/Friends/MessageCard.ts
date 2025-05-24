import { X } from 'lucide';
import { Card } from '../../../components/card';
import { Wrapper } from '../../../components/wrapper';
import { Text } from '../../../components/text';
import { Img } from '../../../components/img';
import { Icon } from '../../../components/icon';
import { Input } from '../../../components/input';
import { Button } from '../../../components/button';
import { Toaster } from '../../../components/toaster';
import { type User } from '../../../types/user';

export function MessageCard(friend: User | null) {
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
		src: friend.profilePicture || 'https://i.pravatar.cc/300',
		alt: 'friend',
		classes: ['w-8', 'h-8', 'rounded-full'],
		loading: 'lazy',
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
	const chat = Wrapper({
		classes: ['flex', 'flex-col', 'gap-2', 'h-72', 'overflow-y-auto'],
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

	closeTrigger.addEventListener('click', () => {
		card.remove();
	});

	const socket = new WebSocket(`ws://localhost:3000/message/${friend?.id}`);

	socket.addEventListener('message', (event) => {
		console.log('Message from server:', event.data);
	});

	messageForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		if (socket.readyState === WebSocket.OPEN) {
			const message = input.value.trim();
			if (message) {
				input.value = '';
			}
			socket.send(JSON.stringify({ type: 'chat_message', content: message }));
			input.value = ''; // Clear input after sending
		} else {
			console.log('WebSocket is not open yet.');
		}
	});

	friendEl.appendChild(img);
	friendEl.appendChild(name);
	menu.appendChild(friendEl);
	menu.appendChild(closeTrigger);
	messageForm.appendChild(input);
	messageForm.appendChild(sendButton);
	card.appendChild(menu);
	card.appendChild(chat);
	card.appendChild(messageForm);

	return card;
}
