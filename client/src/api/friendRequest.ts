import { store } from '../store';

export async function sendFriendRequest(friendUsername: string) {
	try {
		const res = await fetch('http://localhost:3000/friend-request/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: friendUsername }),
			credentials: 'include',
		});

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.message || 'Failed to send friend request');
		}
	} catch (error) {
		// Handle error (e.g., show a notification to the user)
		console.error('Error adding friend:', error);
	}
}

export async function getFriendRequest() {
	try {
		const res = await fetch('http://localhost:3000/friend-request/get', {
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
						senderId: f.senderId,
						senderUsername: f.senderUsername,
						senderAvatar: f.senderAvatar,
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
		const res = await fetch('http://localhost:3000/friend-request/accept', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ requestId }),
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			console.error('Failed to accept request:', data.message);
			return;
		}

		console.log('Friend request accepted');
	} catch (error) {
		console.error('Error accepting friend request:', error);
	}
}

export async function rejectFriendRequest(requestId: number) {
	try {
		const res = await fetch('http://localhost:3000/friend-request/reject', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ requestId }),
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			console.error('Failed to reject request:', data.message);
			return;
		}

		console.log('Friend request rejected');
	} catch (error) {
		console.error('Error rejecting friend request:', error);
	}
}
