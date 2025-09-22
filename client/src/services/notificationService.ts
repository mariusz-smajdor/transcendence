import { Toaster } from '../components/toaster';

export const NOTIFICATION_TYPES = {
	FRIEND_REQUEST: 'friend_request',
	FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
	FRIEND_REQUEST_REJECTED: 'friend_request_rejected',
	FRIEND_REMOVED: 'friend_removed',
	MESSAGE: 'message',
	CONNECTION_ESTABLISHED: 'connection_established',
} as const;

// Event system for notifying components of data changes
type DataChangeEvent =
	| 'friendRequestsUpdated'
	| 'friendsUpdated'
	| 'messagesUpdated';

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

	connect() {
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

			const wsUrl = `ws://localhost:3000/notifications?token=${encodeURIComponent(
				token
			)}`;
			this.ws = new WebSocket(wsUrl);

			this.ws.onopen = () => {
				console.log('✅ WebSocket connected successfully');
				this.isConnecting = false;
				this.reconnectAttempts = 0;
			};

			this.ws.onmessage = (event) => {
				try {
					const notification: NotificationData = JSON.parse(event.data);
					console.log('📨 Received notification:', notification);
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

	private attemptReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(
				`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
			);

			setTimeout(() => {
				this.connect();
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

			default:
				console.log('Unknown notification type:', notification.type);
		}
	}

	private handleFriendRequest(notification: NotificationData) {
		console.log('🔔 Handling friend request notification:', notification);
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

		// Emit event to update messages UI
		dataChangeEmitter.emit('messagesUpdated');
	}

	private async refreshFriendRequests() {
		try {
			console.log('🔄 Refreshing friend requests...');
			const { getFriendRequests } = await import('../api/friendRequest');
			await getFriendRequests();
			dataChangeEmitter.emit('friendRequestsUpdated');
			console.log('✅ Friend requests refreshed');
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
}

// Export singleton instance
export const notificationService = new NotificationService();
