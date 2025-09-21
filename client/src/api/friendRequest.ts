import { Toaster } from '../components/toaster';
import { store } from '../store';

export async function getFriends() {
	try {
		const res = await fetch('http://localhost:3000/api/friends', {
			method: 'GET',
			credentials: 'include',
		});

		const data = await res.json();
		if (!res.ok || !data.success) return;

		store.setState({
			user: {
				...store.getState().user!,
				friends: data.friends,
			},
		});
	} catch (error) {
		console.error('Failed to fetch friends:', error);
	}
}

export async function sendFriendRequest(friendUsername: string) {
	try {
		const res = await fetch('http://localhost:3000/api/friends/request', {
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
	} catch (error: unknown) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to send friend request.');
		}
	}
}

export async function getFriendRequest() {
	try {
		const res = await fetch('http://localhost:3000/api/friends/requests/pending', {
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

		const currentUser = store.getState().user;
		if (!currentUser) return;

		store.setState({
			user: {
				...currentUser,
				friendRequests: currentUser.friendRequests?.filter(
					(req) => req.senderId !== data.friend.id
				),
				friends: [...(currentUser.friends || []), data.friend],
			},
		});

		Toaster('Friend request accepted');
	} catch (error) {
		if (error instanceof Error) {
			Toaster(error.message);
		} else {
			Toaster('Failed to add a friend.');
		}
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

		const currentUser = store.getState().user;
		if (!currentUser) return;

		store.setState({
			user: {
				...currentUser,
				friendRequests: currentUser.friendRequests?.filter(
					(req) => req.senderId !== data.senderId
				),
			},
		});

		Toaster('Friend request rejected');
	} catch (error) {
		console.error('Error rejecting friend request:', error);
	}
}
