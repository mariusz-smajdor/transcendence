import { Toaster } from '../components/toaster';

export const NOTIFICATION_TYPES = {
	FRIEND_REQUEST: 'friend_request',
	FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
	FRIEND_REQUEST_REJECTED: 'friend_request_rejected',
	FRIEND_REMOVED: 'friend_removed',
	MESSAGE: 'message',
	CONNECTION_ESTABLISHED: 'connection_established',
	FRIEND_ONLINE: 'friend_online',
	FRIEND_OFFLINE: 'friend_offline',
} as const;

// Event system for notifying components of data changes
type DataChangeEvent =
	| 'friendRequestsUpdated'
	| 'friendsUpdated'
	| 'messagesUpdated'
	| 'friendOnline'
	| 'friendOffline';

class EventEmitter {
	private listeners: Map<DataChangeEvent, Function[]> = new Map();

	on(event: DataChangeEvent, callback: Function) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(callback);
	}

	off(event: DataChangeEvent, callback: Function) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			const index = eventListeners.indexOf(callback);
			if (index > -1) {
				eventListeners.splice(index, 1);
			}
		}
	}

	emit(event: DataChangeEvent, data?: any) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.forEach((callback) => callback(data));
		}
	}
}

export const dataChangeEmitter = new EventEmitter();

type NotificationData = {
	type: string;
	data: any;
	message: string;
	timestamp?: number;
};

class NotificationService {
	private ws: WebSocket | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private isConnecting = false;

	async connect() {
		if (
			this.isConnecting ||
			(this.ws && this.ws.readyState === WebSocket.OPEN)
		) {
			return;
		}

		this.isConnecting = true;

		try {
			// Get the access token from cookies
			const token = this.getAccessToken();
			if (!token) {
				console.error('No access token found for WebSocket connection');
				this.isConnecting = false;
				return;
			}

			// Validate token before attempting connection
			const isValidToken = await this.validateToken();
			if (!isValidToken) {
				console.log('Token validation failed, skipping WebSocket connection');
				this.isConnecting = false;
				return;
			}

			const wsUrl = `wss://localhost:8080/notifications?token=${encodeURIComponent(
				token
			)}`;
			this.ws = new WebSocket(wsUrl);

			this.ws.onopen = () => {
				this.isConnecting = false;
				this.reconnectAttempts = 0;
			};

			this.ws.onmessage = (event) => {
				try {
					const notification: NotificationData = JSON.parse(event.data);
					this.handleNotification(notification);
				} catch (error) {
					console.error('Error parsing notification:', error);
				}
			};

			this.ws.onclose = (event) => {
				console.log(
					`Disconnected from notifications WebSocket. Code: ${event.code}, Reason: ${event.reason}`
				);
				this.isConnecting = false;
				this.attemptReconnect();
			};

			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error);
				this.isConnecting = false;
			};
		} catch (error) {
			console.error('Failed to create WebSocket connection:', error);
			this.isConnecting = false;
			this.attemptReconnect();
		}
	}

	private async attemptReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(
				`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
			);

			setTimeout(async () => {
				await this.connect();
			}, this.reconnectDelay * this.reconnectAttempts);
		} else {
			console.log('Max reconnection attempts reached');
			Toaster('Failed to connect to notifications. Try again later.');
		}
	}

	private handleNotification(notification: NotificationData) {
		switch (notification.type) {
			case NOTIFICATION_TYPES.CONNECTION_ESTABLISHED:
				break;

			case NOTIFICATION_TYPES.FRIEND_REQUEST:
				this.handleFriendRequest(notification);
				break;

			case NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED:
				this.handleFriendRequestAccepted(notification);
				break;

			case NOTIFICATION_TYPES.FRIEND_REQUEST_REJECTED:
				this.handleFriendRequestRejected(notification);
				break;

			case NOTIFICATION_TYPES.FRIEND_REMOVED:
				this.handleFriendRemoved(notification);
				break;

			case NOTIFICATION_TYPES.MESSAGE:
				this.handleMessage(notification);
				break;

			case NOTIFICATION_TYPES.FRIEND_ONLINE:
				this.handleFriendOnline(notification);
				break;

			case NOTIFICATION_TYPES.FRIEND_OFFLINE:
				this.handleFriendOffline(notification);
				break;

			default:
				console.log('Unknown notification type:', notification.type);
		}
	}

	private handleFriendRequest(notification: NotificationData) {
		// Show toast notification
		Toaster(notification.message);

		// Refresh friend requests list
		this.refreshFriendRequests();
	}

	private handleFriendRequestAccepted(notification: NotificationData) {
		// Show toast notification
		Toaster(notification.message);

		// Refresh friends list
		this.refreshFriends();
	}

	private handleFriendRequestRejected(notification: NotificationData) {
		// Show toast notification
		Toaster(notification.message);
	}

	private handleFriendRemoved(notification: NotificationData) {
		// Show toast notification
		Toaster(notification.message);

		// Refresh friends list
		this.refreshFriends();
	}

	private handleMessage(notification: NotificationData) {
		// Show toast notification
		Toaster(notification.message);

		// Find the message button for the sender and change its color
		const senderMessageIcon = document.querySelector(
			`[data-chatter-id="${notification.data.senderId}"]`
		);
		const senderMessageCard = document.querySelector(
			`[data-chatter="${notification.data.senderId}"]`
		);

		// Only change button color if the chat is not currently open
		if (senderMessageIcon && !senderMessageCard) {
			// Remove white color and add glow effect to indicate unread message
			senderMessageIcon.classList.remove('text-white');
			senderMessageIcon.classList.add('glow-secondary-animate');
		} else if (senderMessageCard) {
			// Chat is open, don't change button color but still update messages
			console.log('Chat is open with sender, not changing button color');
		} else {
			console.log(
				'Message button not found for senderId:',
				notification.data.senderId
			);
		}

		// Emit event to update messages UI
		dataChangeEmitter.emit('messagesUpdated');
	}

	private async refreshFriendRequests() {
		try {
			const { getFriendRequests } = await import('../api/friendRequest');
			await getFriendRequests();
			dataChangeEmitter.emit('friendRequestsUpdated');
		} catch (error) {
			console.error('Failed to refresh friend requests:', error);
		}
	}

	private async refreshFriends() {
		try {
			const { getFriends } = await import('../api/friendRequest');
			await getFriends();
			dataChangeEmitter.emit('friendsUpdated');
		} catch (error) {
			console.error('Failed to refresh friends:', error);
		}
	}

	private handleFriendOnline(notification: NotificationData) {
		console.log('Friend came online:', notification.data.friendUsername);

		// Find the friend's avatar and add green dot
		const friendId = notification.data.friendId;
		const friendRow = document.querySelector(`[data-friend-id="${friendId}"]`);

		if (friendRow) {
			// Check if green dot already exists
			const existingDot = friendRow.querySelector('.online-indicator');
			if (!existingDot) {
				// Find the avatar wrapper (using relative class)
				const avatarWrapper = friendRow.querySelector(
					'.flex.items-center.gap-4.relative'
				);
				if (avatarWrapper) {
					// Create online indicator
					const onlineIndicator = document.createElement('div');
					onlineIndicator.className = 'online-indicator';
					onlineIndicator.style.cssText = `
						position: absolute;
						width: 10px;
						height: 10px;
						background-color: #22c55e;
						border-radius: 50%;
						border: 2px solid var(--background);
						margin-left: 26px;
						margin-top: 26px;
						box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
					`;

					// Insert at the beginning so it appears over the avatar
					avatarWrapper.insertBefore(onlineIndicator, avatarWrapper.firstChild);
				}
			}

			// Show invite button
			const inviteButton = friendRow.querySelector(
				'.invite-game-btn'
			) as HTMLElement;
			if (inviteButton) {
				inviteButton.style.display = 'block';
			}
		}

		// Emit event for any components that need to react
		dataChangeEmitter.emit('friendOnline', notification.data);
	}

	private handleFriendOffline(notification: NotificationData) {
		console.log('Friend went offline:', notification.data.friendUsername);

		// Find the friend's avatar and remove green dot
		const friendId = notification.data.friendId;
		const friendRow = document.querySelector(`[data-friend-id="${friendId}"]`);

		if (friendRow) {
			const onlineIndicator = friendRow.querySelector('.online-indicator');
			if (onlineIndicator) {
				onlineIndicator.remove();
			}

			// Hide invite button
			const inviteButton = friendRow.querySelector(
				'.invite-game-btn'
			) as HTMLElement;
			if (inviteButton) {
				inviteButton.style.display = 'none';
			}
		}

		// Emit event for any components that need to react
		dataChangeEmitter.emit('friendOffline', notification.data);
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}

	isConnected(): boolean {
		return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
	}

	private getAccessToken(): string | null {
		const cookies = document.cookie.split(';');
		for (const cookie of cookies) {
			const [name, value] = cookie.trim().split('=');
			if (name === 'access_token') {
				return value;
			}
		}
		return null;
	}

	private async validateToken(): Promise<boolean> {
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
}

// Export singleton instance
export const notificationService = new NotificationService();
