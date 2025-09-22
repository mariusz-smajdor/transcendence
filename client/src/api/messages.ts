import { Toaster } from '../components/toaster';
import { dataChangeEmitter } from '../services/notificationService';

export async function sendMessage(receiverId: number, message: string) {
	try {
		const res = await fetch('http://localhost:3000/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ receiverId, message }),
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to send message');
		}

		// Emit event to update messages UI
		dataChangeEmitter.emit('messagesUpdated');
	} catch (error: unknown) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to send message');
		}
	}
}

export async function getMessages(otherUserId: number) {
	try {
		const res = await fetch(
			`http://localhost:3000/messages?otherUserId=${otherUserId}`,
			{
				method: 'GET',
				credentials: 'include',
			}
		);

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to fetch messages');
		}

		return data.messages;
	} catch (error: unknown) {
		console.error('Failed to fetch messages:', error);
		return [];
	}
}

export async function getConversations() {
	try {
		const res = await fetch('http://localhost:3000/conversations', {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to fetch conversations');
		}

		return data.conversations;
	} catch (error: unknown) {
		console.error('Failed to fetch conversations:', error);
		return [];
	}
}

export async function markMessagesAsRead(otherUserId: number) {
	try {
		const res = await fetch('http://localhost:3000/messages/read', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ otherUserId }),
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			console.error('Failed to mark messages as read:', data.message);
		}
	} catch (error: unknown) {
		console.error('Failed to mark messages as read:', error);
	}
}
