import { MessageCircle, UserPlus, Users, UserX } from 'lucide';
import { Wrapper } from '../../../components/wrapper';
import { Card } from '../../../components/card';
import { Heading } from '../../../components/heading';
import { Icon } from '../../../components/icon';
import { Tabs, Tab, Trigger } from '../../../components/tabs';
import { Input } from '../../../components/input';
import { Img } from '../../../components/img';
import { Text } from '../../../components/text';
import { Button } from '../../../components/button';
import {
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
	sendFriendRequest,
} from '../../../api/friendRequest';
// import { onInvitation, sendInvitation } from '../../../api/invitationSocket';
import { store } from '../../../store';
import { MessageCard } from './MessageCard';
import { dataChangeEmitter } from '../../../services/notificationService';
import { Toaster } from '../../../components/toaster';
// import { showGameOverlay } from '../../game/game-overlay';

function addFriendHandler(e: Event, friendInput: HTMLInputElement) {
	e.preventDefault();

	const friendUsername = friendInput.value.trim();

	if (!friendUsername) {
		friendInput.focus();
		return;
	}

	sendFriendRequest(friendUsername);
}

function FriendRequestTab() {
	const tab = Tab({
		value: 'requests',
		classes: ['flex', 'flex-col', 'gap-4'],
	});
	const wrapper = Wrapper({ classes: ['flex', 'flex-col', 'gap-1'] });
	const noFriendsMessage = Text({
		content: 'No friend requests',
		classes: ['text-muted', 'text-center', 'py-4', 'lg:py-6'],
	});

	function renderFriendRequests() {
		wrapper.innerHTML = '';
		const currentUser = store.getState().user;

		if (!currentUser?.friendRequests?.length) {
			wrapper.appendChild(noFriendsMessage);
			return;
		}

		currentUser.friendRequests.forEach((f) => {
			const friends = Wrapper({
				classes: [
					'flex',
					'p-2',
					'items-center',
					'justify-between',
					'gap-2',
					'rounded',
					'hover:bg-background/25',
				],
			});
			const friend = Wrapper({
				classes: ['flex', 'items-center', 'gap-4'],
			});
			const avatar = Img({
				src: f.senderAvatar
					? `http://localhost:3000${f.senderAvatar}`
					: `https://ui-avatars.com/api/?length=1&name=${f.senderUsername}&background=random`,
				alt: f.senderUsername,
				width: 35,
				height: 35,
				classes: ['rounded-full', 'border', 'border-accent'],
			});
			const name = Text({
				element: 'span',
				content: f.senderUsername,
				classes: ['text-sm'],
			});
			const buttons = Wrapper({ classes: ['flex', 'gap-4'] });
			const addButton = Button({
				type: 'button',
				variant: 'ghost',
				classes: ['text-green-400'],
			});
			const rejectButton = Button({
				type: 'button',
				variant: 'ghost',
				classes: ['text-red-400'],
			});

			addButton.addEventListener('click', () => {
				acceptFriendRequest(f.id);
				// Immediately remove the request from UI
				wrapper.removeChild(friends);
				// Show no requests message if list is empty
				if (wrapper.childElementCount === 0) {
					wrapper.appendChild(noFriendsMessage);
				}
			});
			rejectButton.addEventListener('click', () => {
				rejectFriendRequest(f.id);
				// Immediately remove the request from UI
				wrapper.removeChild(friends);
				// Show no requests message if list is empty
				if (wrapper.childElementCount === 0) {
					wrapper.appendChild(noFriendsMessage);
				}
			});

			addButton.appendChild(Icon({ icon: UserPlus }));
			rejectButton.appendChild(Icon({ icon: UserX }));
			buttons.appendChild(addButton);
			buttons.appendChild(rejectButton);
			friend.appendChild(avatar);
			friend.appendChild(name);
			friends.appendChild(friend);
			friends.appendChild(buttons);
			wrapper.appendChild(friends);
		});
	}

	// Listen for friend requests updates
	dataChangeEmitter.on('friendRequestsUpdated', renderFriendRequests);

	// Initial render
	renderFriendRequests();

	tab.appendChild(wrapper);

	return tab;
}

function AllFriendsTab() {
	const tab = Tab({
		value: 'all-friends',
		classes: ['flex', 'flex-col', 'gap-4'],
	});
	const wrapper = Wrapper({
		classes: ['flex', 'flex-col', 'gap-1'],
	});
	const searchInput = Input({
		type: 'text',
		name: 'search friends',
		placeholder: 'Search friends...',
		classes: ['text-sm', 'bg-background'],
	});

	function renderFriends() {
		wrapper.innerHTML = '';

		const value = searchInput.value.trim().toLowerCase();

		const friendsList = store.getState().user?.friends ?? [];
		const filteredFriends = friendsList.filter((f) => {
			if (!value) return true;
			return f.username.toLowerCase().includes(value);
		});

		filteredFriends.forEach((f) => {
			const friends = Wrapper({
				classes: [
					'flex',
					'p-2',
					'items-center',
					'justify-between',
					'gap-2',
					'rounded',
					'hover:bg-background/25',
				],
			});
			friends.dataset.friendId = String(f.id);

			const friend = Wrapper({
				classes: ['flex', 'items-center', 'gap-4'],
			});
			const avatar = Img({
				src: f.avatar
					? `http://localhost:3000${f.avatar}`
					: `https://ui-avatars.com/api/?length=1&name=${f.username}&background=random`,
				alt: f.username,
				width: 35,
				height: 35,
				classes: ['rounded-full', 'border', 'border-accent'],
			});
			const name = Text({
				element: 'span',
				content: f.username,
				classes: ['text-sm'],
			});
			const buttonsContainer = Wrapper({
				classes: ['flex', 'gap-2', 'ml-auto'],
			});
			const msgButton = Button({
				type: 'button',
				variant: 'ghost',
				classes: ['text-white'],
			});
			msgButton.dataset.chatterId = f.id.toString();
			const msgIcon = Icon({
				icon: MessageCircle,
			});
			const removeButton = Button({
				type: 'button',
				variant: 'ghost',
				classes: ['text-red-400'],
			});
			const removeIcon = Icon({
				icon: UserX,
			});

			msgButton.addEventListener('click', () => {
				// Reset message button color to white when opening chat
				msgButton.classList.remove('text-red-400');
				msgButton.classList.add('text-white');

				// Remove existing message card if any
				const existingCard = document.querySelector('[data-chatter]');
				if (existingCard) {
					existingCard.remove();
				}

				// Create new message card
				const messageCard = MessageCard(f);
				if (messageCard) {
					document.body.appendChild(messageCard);
				}
			});

			removeButton.addEventListener('click', async () => {
				try {
					await removeFriend(f.id);
				} catch (error) {
					if (error instanceof Error) {
						Toaster(error.message);
					} else {
						Toaster('Failed to remove friend.');
					}
				}
			});

			msgButton.appendChild(msgIcon);
			removeButton.appendChild(removeIcon);
			buttonsContainer.appendChild(msgButton);
			buttonsContainer.appendChild(removeButton);
			friend.appendChild(avatar);
			friend.appendChild(name);
			friends.appendChild(friend);
			friends.appendChild(buttonsContainer);
			wrapper.appendChild(friends);
		});
	}

	// onInvitation((data) => {
	// 	if (data.type === 'invite' && data.fromUserId) {
	// 		const friendRow = wrapper.querySelector(
	// 			`[data-friend-id="${data.fromUserId}"]`
	// 		);
	// 		if (friendRow && !friendRow.querySelector('.invitation-to-game-btn')) {
	// 			const invitationToGame = Button({
	// 				type: 'button',
	// 				content: 'Invited to game',
	// 				classes: [
	// 					'flex',
	// 					'gap-2',
	// 					'items-center',
	// 					'text-sm',
	// 					'invitation-to-game-btn',
	// 				],
	// 			});
	// 			invitationToGame.onclick = () => {
	// 				sendInvitation({
	// 					type: 'accept',
	// 					message: 'Invitation accepted',
	// 					toUserId: data.fromUserId,
	// 				});
	// 				friendRow.removeChild(invitationToGame);
	// 			};
	// 			friendRow.appendChild(invitationToGame);
	// 		}
	// 	}
	// });

	// onInvitation((data) => {
	// 	if (data.type === 'uninvite' && data.fromUserId) {
	// 		const friendRow = wrapper.querySelector(
	// 			`[data-friend-id="${data.fromUserId}"]`
	// 		);
	// 		const invitationBtn = friendRow?.querySelector('.invitation-to-game-btn');
	// 		if (friendRow && invitationBtn) {
	// 			friendRow.removeChild(invitationBtn);
	// 		}
	// 	}
	// });

	// onInvitation((data) => {
	// 	if (data.type === 'game_start_with_id' && data.gameId) {
	// 		showGameOverlay(data.gameId, 'network');
	// 		const newUrl = `/game?gameId=${data.gameId}`;
	// 		history.pushState({ gameId: data.gameId }, `Game ${data.gameId}`, newUrl);
	// 	}
	// });

	searchInput.addEventListener('input', renderFriends);

	// Listen for friends updates
	dataChangeEmitter.on('friendsUpdated', renderFriends);

	// Initial render
	renderFriends();

	tab.appendChild(searchInput);
	tab.appendChild(wrapper);

	return tab;
}

export default function Friends() {
	const section = Card({
		element: 'section',
		classes: [
			'flex',
			'flex-col',
			'gap-4',
			'relative',
			'lg:gap-6',
			'lg:col-span-2',
			'lg:row-span-2',
		],
	});
	const heading = Heading({
		level: 2,
		content: 'Friends',
		classes: ['flex', 'items-center', 'gap-2'],
	});
	const form = Wrapper({
		element: 'form',
		method: 'POST',
		classes: ['flex', 'flex-row-reverse', 'gap-2'],
	});
	const addIcon = Icon({
		icon: UserPlus,
		size: 'sm',
		strokeWidth: 2.5,
	});
	const addFriend = Button({
		type: 'submit',
		content: 'Add',
		classes: ['flex', 'gap-2', 'items-center', 'text-sm'],
	});
	const friendUsername = Input({
		type: 'text',
		name: 'friend-username',
		placeholder: 'Add friend by username...',
		classes: ['text-sm', 'bg-background'],
	});
	const requestsTrigger = Trigger({
		content: 'Requests',
		value: 'requests',
	});

	function updateRequestsCount() {
		const { user } = store.getState();
		// Remove existing count if any
		const existingCount = requestsTrigger.querySelector('.requests-count');
		if (existingCount) {
			requestsTrigger.removeChild(existingCount);
		}

		if (user?.friendRequests?.length) {
			requestsTrigger.classList.add(
				'flex',
				'items-center',
				'justify-center',
				'gap-2'
			);
			const requestsCount = Wrapper({
				classes: [
					'bg-secondary',
					'rounded-full',
					'px-2.5',
					'text-white',
					'text-bold',
					'text-xs',
					'requests-count',
				],
			});
			requestsCount.textContent = user.friendRequests.length.toString();
			requestsTrigger.appendChild(requestsCount);
		} else {
			requestsTrigger.classList.remove(
				'flex',
				'items-center',
				'justify-center',
				'gap-2'
			);
		}
	}

	// Listen for friend requests updates to update the count
	dataChangeEmitter.on('friendRequestsUpdated', updateRequestsCount);

	// Initial count update
	updateRequestsCount();

	heading.prepend(
		Icon({
			icon: Users,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		})
	);
	section.appendChild(heading);
	section.appendChild(
		Tabs({
			defaultValue: 'all-friends',
			triggers: [
				Trigger({ content: 'All Friends', value: 'all-friends' }),
				requestsTrigger,
			],
			tabs: [AllFriendsTab(), FriendRequestTab()],
		})
	);
	addFriend.prepend(addIcon);
	form.appendChild(addFriend);
	form.appendChild(friendUsername);
	form.addEventListener('submit', (e) => addFriendHandler(e, friendUsername));
	section.appendChild(form);

	return section;
}
