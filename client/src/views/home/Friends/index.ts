import {
	MessageCircle,
	UserPlus,
	Users,
	UserX,
	Gamepad2,
	Ban,
	ShieldOff,
} from 'lucide';
import { Wrapper } from '../../../components/wrapper';
import { Card } from '../../../components/card';
import { Heading } from '../../../components/heading';
import { Icon } from '../../../components/icon';
import { Tabs, Tab, Trigger } from '../../../components/tabs';
import { Input } from '../../../components/input';
import { Img } from '../../../components/img';
import { Text } from '../../../components/text';
import { Button } from '../../../components/button';
import { getAvatarUrl } from '../../../utils/avatarUtils';
import {
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
	sendFriendRequest,
	getOnlineFriends,
	blockUser,
	unblockUser,
	getBlockedUsers,
} from '../../../api/friendRequest';
import { getConversations } from '../../../api/messages';
import { store } from '../../../store';
import { MessageCard } from './MessageCard';
import { dataChangeEmitter } from '../../../services/notificationService';
import { Toaster } from '../../../components/toaster';
import { onInvitation, sendInvitation } from '../../../api/invitationSocket';
import {
	handleGameAcceptance,
	handleGameStart,
} from '../../../utils/gameInvitationHandler';
import { historyManager } from '../../../utils/historyManager';

// Track which friends have unread messages
const unreadMessages = new Set<number>();

// Helper function to create online indicator
function createOnlineIndicator(): HTMLDivElement {
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
	return onlineIndicator;
}

// Function to add online indicators to currently online friends
async function updateOnlineStatus() {
	const onlineFriends = await getOnlineFriends();
	const onlineSet = new Set(onlineFriends);

	// Remove all existing indicators first
	document.querySelectorAll('.online-indicator').forEach((el) => el.remove());

	// Update all friend rows
	document.querySelectorAll('[data-friend-id]').forEach((friendRow) => {
		const friendId = parseInt(friendRow.getAttribute('data-friend-id') || '0');
		const inviteButton = friendRow.querySelector(
			'.invite-game-btn'
		) as HTMLElement;
		const isOnline = onlineSet.has(friendId);

		if (isOnline) {
			// Add online indicator
			const avatarWrapper = friendRow.querySelector(
				'.flex.items-center.gap-4.relative'
			);
			if (avatarWrapper && !avatarWrapper.querySelector('.online-indicator')) {
				const indicator = createOnlineIndicator();
				avatarWrapper.insertBefore(indicator, avatarWrapper.firstChild);
			}

			// Show invite button
			if (inviteButton) {
				inviteButton.style.display = 'block';
			}
		} else {
			// Hide invite button for offline friends
			if (inviteButton) {
				inviteButton.style.display = 'none';
			}
		}
	});
}

async function checkUnreadMessages() {
	try {
		const conversations = await getConversations();
		unreadMessages.clear();

		// Check each conversation for unread messages
		conversations.forEach((conversation: any) => {
			if (conversation.unread_count > 0) {
				unreadMessages.add(conversation.user_id);
			}
		});

		// Apply glow effect to message buttons for friends with unread messages
		unreadMessages.forEach((friendId) => {
			const messageButton = document.querySelector(
				`[data-chatter-id="${friendId}"]`
			);
			if (messageButton) {
				messageButton.classList.remove('text-white');
				messageButton.classList.add('glow-secondary-animate');
			}
		});
	} catch (error) {
		console.error('Failed to check unread messages:', error);
	}
}

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
				src: getAvatarUrl(f.senderAvatar, f.senderUsername),
				alt: f.senderUsername,
				width: 35,
				height: 35,
				classes: ['rounded-full', 'border', 'border-accent', 'aspect-square'],
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
	wrapper.setAttribute('data-friends-wrapper', 'true');
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
					'cursor-pointer',
				],
			});
			friends.dataset.friendId = String(f.id);

			// Add click handler to open friend profile
			friends.addEventListener('click', (e) => {
				// Don't trigger if clicking on buttons
				if ((e.target as HTMLElement).closest('button')) {
					return;
				}

				// Debug: Check if we can access the debug endpoint first
				fetch('/api/debug/friends', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				})
					.then((res) => res.json())
					.then((debugData) => {
						console.log('Debug friends data:', debugData);

						// Import and show friend profile modal
						import('../../profile/friendProfile.js').then((module) => {
							const FriendProfile = module.default;
							const friendProfileModal = FriendProfile(f.id);
							document.body.appendChild(friendProfileModal);
						});
					})
					.catch((err) => {
						console.error('Debug friends error:', err);
						// Still try to open the profile modal
						import('../../profile/friendProfile.js').then((module) => {
							const FriendProfile = module.default;
							const friendProfileModal = FriendProfile(f.id);
							document.body.appendChild(friendProfileModal);
						});
					});
			});

			const friend = Wrapper({
				classes: ['flex', 'items-center', 'gap-4', 'relative'],
			});
			const avatar = Img({
				src: getAvatarUrl(f.avatar, f.username),
				alt: f.username,
				width: 35,
				height: 35,
				classes: ['rounded-full', 'border', 'border-accent', 'aspect-square'],
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
			const inviteButton = Button({
				type: 'button',
				variant: 'ghost',
				classes: ['text-green-400', 'invite-game-btn'],
			});
			inviteButton.dataset.friendId = f.id.toString();
			// Hide by default, will be shown for online friends
			inviteButton.style.display = 'none';
			const inviteIcon = Icon({
				icon: Gamepad2,
			});
			const blockButton = Button({
				type: 'button',
				variant: 'ghost',
				classes: ['text-orange-400'],
			});
			const blockIcon = Icon({
				icon: Ban,
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
				msgButton.classList.remove('glow-secondary-animate');
				msgButton.classList.add('text-white');

				// Remove from unread messages set
				unreadMessages.delete(f.id);

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

			inviteButton.addEventListener('click', () => {
				// Send game invitation
				sendInvitation({
					type: 'invite',
					toUserId: f.id,
					message: `${store.getState().user?.username} invited you to play`,
				});
				Toaster(`Game invitation sent to ${f.username}`);
			});

			blockButton.addEventListener('click', async () => {
				try {
					await blockUser(f.id);
				} catch (error) {
					if (error instanceof Error) {
						Toaster(error.message);
					} else {
						Toaster('Failed to block user.');
					}
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
			inviteButton.appendChild(inviteIcon);
			blockButton.appendChild(blockIcon);
			removeButton.appendChild(removeIcon);
			buttonsContainer.appendChild(msgButton);
			buttonsContainer.appendChild(inviteButton);
			buttonsContainer.appendChild(blockButton);
			buttonsContainer.appendChild(removeButton);
			friend.appendChild(avatar);
			friend.appendChild(name);
			friends.appendChild(friend);
			friends.appendChild(buttonsContainer);
			wrapper.appendChild(friends);
		});
	}

	// Store unsubscribe functions for cleanup
	const unsubscribeFunctions: (() => void)[] = [];

	// Reopen friend modal on forward navigation if modal state exists
	const handleModalState = (state: any) => {
		if (
			state?.data?.modal === 'friendProfile' &&
			typeof state.data.friendId === 'number'
		) {
			// Guard: don't open a duplicate modal
			if (!document.querySelector('[data-friend-profile-modal="true"]')) {
				import('../../profile/friendProfile.js').then((module) => {
					const FriendProfile = module.default;
					const friendProfileModal = FriendProfile(state.data.friendId, {
						pushState: false,
					});
					document.body.appendChild(friendProfileModal);
				});
			}
		}
	};
	unsubscribeFunctions.push(() =>
		historyManager.off('modal', handleModalState as any)
	);
	historyManager.on('modal', handleModalState as any);

	// Handle invitation events
	unsubscribeFunctions.push(
		onInvitation((data) => {
			if (data.type === 'invite' && data.fromUserId) {
				const friendRow = wrapper.querySelector(
					`[data-friend-id="${data.fromUserId}"]`
				);
				if (friendRow && !friendRow.querySelector('.invitation-to-game-btn')) {
					const invitationToGame = Button({
						type: 'button',
						content: 'Invited to game',
						classes: [
							'flex',
							'gap-2',
							'items-center',
							'text-sm',
							'invitation-to-game-btn',
						],
					});
					invitationToGame.onclick = () => {
						sendInvitation({
							type: 'accept',
							message: 'Invitation accepted',
							toUserId: data.fromUserId,
						});
						friendRow.removeChild(invitationToGame);
					};
					friendRow.appendChild(invitationToGame);
				}
			}
		})
	);

	unsubscribeFunctions.push(
		onInvitation((data) => {
			if (data.type === 'uninvite' && data.fromUserId) {
				const friendRow = wrapper.querySelector(
					`[data-friend-id="${data.fromUserId}"]`
				);
				const invitationBtn = friendRow?.querySelector(
					'.invitation-to-game-btn'
				);
				if (friendRow && invitationBtn) {
					friendRow.removeChild(invitationBtn);
				}
			}
		})
	);

	unsubscribeFunctions.push(
		onInvitation(async (data) => {
			if (data.type === 'game_start' && data.fromUserId) {
				// Inviter receives acceptance - create game and send gameId back
				await handleGameAcceptance(data.fromUserId);
			}
		})
	);

	unsubscribeFunctions.push(
		onInvitation((data) => {
			if (data.type === 'game_start_with_id' && data.gameId) {
				handleGameStart(data.gameId);
			}
		})
	);

	// Cleanup function to remove all handlers
	const cleanup = () => {
		unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
		unsubscribeFunctions.length = 0;
	};

	// Store cleanup function on the wrapper for later use
	(wrapper as any).__cleanupInvitationHandlers = cleanup;

	searchInput.addEventListener('input', renderFriends);

	// Listen for friends updates
	dataChangeEmitter.on('friendsUpdated', () => {
		renderFriends();
		// Check for unread messages and online status after friends list is updated
		setTimeout(() => {
			checkUnreadMessages();
			updateOnlineStatus();
		}, 200);
	});

	// Listen for friend online/offline events
	dataChangeEmitter.on('friendOnline', () => {
		// The notification service already handles adding the dot
	});

	dataChangeEmitter.on('friendOffline', () => {
		// The notification service already handles removing the dot
	});

	// Initial render
	renderFriends();

	// Check online status after initial render
	setTimeout(() => {
		updateOnlineStatus();
	}, 200);

	tab.appendChild(searchInput);
	tab.appendChild(wrapper);

	return tab;
}

function BlockedUsersTab() {
	const tab = Tab({
		value: 'blocked-users',
		classes: ['flex', 'flex-col', 'gap-4'],
	});
	const wrapper = Wrapper({
		classes: ['flex', 'flex-col', 'gap-1'],
	});

	async function renderBlockedUsers() {
		wrapper.innerHTML = '';

		const blockedUsers = await getBlockedUsers();

		if (blockedUsers.length === 0) {
			const emptyMessage = Text({
				content: 'No blocked users',
				classes: ['text-muted', 'text-center', 'py-4'],
			});
			wrapper.appendChild(emptyMessage);
			return;
		}

		blockedUsers.forEach((user: any) => {
			const userRow = Wrapper({
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

			const userInfo = Wrapper({
				classes: ['flex', 'items-center', 'gap-3'],
			});

			const avatar = Img({
				src: getAvatarUrl(user.avatar, user.username),
				alt: user.username,
				width: 40,
				height: 40,
				classes: ['rounded-full', 'border', 'border-accent', 'aspect-square'],
			});

			const name = Text({
				element: 'span',
				content: user.username,
				classes: ['text-base', 'font-medium'],
			});

			const unblockButton = Button({
				type: 'button',
				variant: 'ghost',
				classes: ['text-green-400', 'flex', 'items-center', 'gap-1'],
			});
			const unblockIcon = Icon({
				icon: ShieldOff,
			});
			const unblockText = Text({
				element: 'span',
				content: 'Unblock',
				classes: ['text-sm'],
			});

			unblockButton.addEventListener('click', async () => {
				try {
					await unblockUser(user.id);
					await renderBlockedUsers(); // Re-render the list
				} catch (error) {
					if (error instanceof Error) {
						Toaster(error.message);
					} else {
						Toaster('Failed to unblock user.');
					}
				}
			});

			unblockButton.appendChild(unblockIcon);
			unblockButton.appendChild(unblockText);
			userInfo.appendChild(avatar);
			userInfo.appendChild(name);
			userRow.appendChild(userInfo);
			userRow.appendChild(unblockButton);
			wrapper.appendChild(userRow);
		});
	}

	// Initial render
	renderBlockedUsers();

	// Listen for blocked users updates
	dataChangeEmitter.on('blockedUsersUpdated', renderBlockedUsers);

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

	// Check for unread messages after component is fully loaded
	setTimeout(() => {
		checkUnreadMessages();
	}, 100);

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
				Trigger({ content: 'Blocked', value: 'blocked-users' }),
			],
			tabs: [AllFriendsTab(), FriendRequestTab(), BlockedUsersTab()],
		})
	);
	addFriend.prepend(addIcon);
	form.appendChild(addFriend);
	form.appendChild(friendUsername);
	form.addEventListener('submit', (e) => addFriendHandler(e, friendUsername));
	section.appendChild(form);

	return section;
}
