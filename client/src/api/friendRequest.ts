import { Toaster } from '../components/toaster';
import { store } from '../store';
import { dataChangeEmitter } from '../services/notificationService';

// Store online friends
let onlineFriendsSet = new Set<number>();

export function getOnlineFriendsSet(): Set<number> {
	return onlineFriendsSet;
}

export async function getOnlineFriends(): Promise<number[]> {
	try {
		const res = await fetch('/api/friends/online', {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) return [];

		// Update the set
		onlineFriendsSet = new Set(data.onlineFriends);

		return data.onlineFriends;
	} catch (error) {
		console.error('Failed to fetch online friends:', error);
		return [];
	}
}

export async function getFriends() {
	try {
		const res = await fetch('/api/friends', {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) return;

		store.setState({
			user: {
				...store.getState().user!,
				friends: data.friends.map((friend: any) => ({
					id: friend.id,
					username: friend.username,
					email: friend.email,
					avatar: friend.avatar,
				})),
			},
		});
	} catch (error) {
		console.error('Failed to fetch friends:', error);
	}
}

export async function sendFriendRequest(username: string) {
	try {
		const res = await fetch('/api/friends/request', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username }),
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to send friend request');
		}

		Toaster('Friend request sent successfully');
	} catch (error: unknown) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to send friend request.');
		}
	}
}

export async function getFriendRequests() {
	try {
		const res = await fetch('/api/friends/requests', {
			method: 'GET',
			credentials: 'include',
		});
		const data = await res.json();
		if (!res.ok || !data.success) return;

		const currentUser = store.getState().user;
		if (currentUser) {
			store.setState({
				user: {
					...currentUser,
					friendRequests: data.requests.map((f: any) => ({
						id: f.id,
						senderId: f.sender_id,
						senderUsername: f.username,
						senderEmail: f.email,
						senderAvatar: f.avatar,
					})),
				},
			});
		}
	} catch (error) {
		console.error('Error fetching friend requests:', error);
	}
}

export async function acceptFriendRequest(requestId: number) {
	try {
		const res = await fetch('/api/friends/accept', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ requestId }),
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to accept request');
		}

		const currentUser = store.getState().user;
		if (!currentUser) return;

		// Remove the accepted request from friendRequests
		store.setState({
			user: {
				...currentUser,
				friendRequests: currentUser.friendRequests?.filter(
					(req) => req.id !== requestId
				),
			},
		});

		// Emit events to update UI
		dataChangeEmitter.emit('friendRequestsUpdated');

		// Refresh friends list to include the new friend
		await getFriends();
		dataChangeEmitter.emit('friendsUpdated');

		Toaster('Friend request accepted');
	} catch (error) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to accept friend request.');
		}
	}
}

export async function rejectFriendRequest(requestId: number) {
	try {
		const res = await fetch('/api/friends/reject', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ requestId }),
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to reject request');
		}

		const currentUser = store.getState().user;
		if (!currentUser) return;

		store.setState({
			user: {
				...currentUser,
				friendRequests: currentUser.friendRequests?.filter(
					(req) => req.id !== requestId
				),
			},
		});

		// Emit event to update UI
		dataChangeEmitter.emit('friendRequestsUpdated');

		Toaster('Friend request rejected');
	} catch (error) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to reject friend request.');
		}
	}
}

export async function removeFriend(friendId: number) {
	try {
		const res = await fetch('/api/friends', {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ friendId }),
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to remove friend');
		}

		const currentUser = store.getState().user;
		if (!currentUser) return;

		store.setState({
			user: {
				...currentUser,
				friends: currentUser.friends?.filter(
					(friend) => friend.id !== friendId
				),
			},
		});

		// Emit event to update UI
		dataChangeEmitter.emit('friendsUpdated');

		Toaster('Friend removed successfully');
	} catch (error) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to remove friend.');
		}
	}
}

export async function blockUser(userId: number) {
	try {
		const res = await fetch('/api/block', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId }),
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to block user');
		}

		const currentUser = store.getState().user;
		if (!currentUser) return;

		// Remove user from friends list if they were friends
		store.setState({
			user: {
				...currentUser,
				friends: currentUser.friends?.filter((friend) => friend.id !== userId),
			},
		});

		// Emit events to update UI
		dataChangeEmitter.emit('friendsUpdated');
		dataChangeEmitter.emit('blockedUsersUpdated');

		Toaster('User blocked successfully');
	} catch (error) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to block user.');
		}
	}
}

export async function unblockUser(userId: number) {
	try {
		const res = await fetch('/api/unblock', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId }),
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			throw new Error(data.message || 'Failed to unblock user');
		}

		Toaster('User unblocked successfully');
	} catch (error) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to unblock user.');
		}
	}
}

export async function getBlockedUsers(): Promise<any[]> {
	try {
		const res = await fetch('/api/blocked', {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) return [];

		return data.blockedUsers;
	} catch (error) {
		console.error('Failed to fetch blocked users:', error);
		return [];
	}
}
