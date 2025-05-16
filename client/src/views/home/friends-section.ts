import { MessageCircle, UserPlus, Users, UserX } from 'lucide';
import { Wrapper } from '../../components/wrapper';
import { Card } from '../../components/card';
import { Heading } from '../../components/heading';
import { Icon } from '../../components/icon';
import { Tabs, Tab, Trigger } from '../../components/tabs';
import { Input } from '../../components/input';
import { Img } from '../../components/img';
import { Text } from '../../components/text';
import { Button } from '../../components/button';
import {
	acceptFriendRequest,
	rejectFriendRequest,
	sendFriendRequest,
} from '../../api/friendRequest';
import { store } from '../../store';

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
	const currentUser = store.getState().user;

	const tab = Tab({
		value: 'requests',
		classes: ['flex', 'flex-col', 'gap-4'],
	});
	const wrapper = Wrapper({ classes: ['flex', 'flex-col', 'gap-1'] });
	const noFriendsMessage = Text({
		content: 'No friend requests',
		classes: ['text-muted', 'text-center', 'py-4', 'lg:py-6'],
	});

	currentUser?.friendRequests?.length === 0
		? wrapper.appendChild(noFriendsMessage)
		: currentUser?.friendRequests?.forEach((f) => {
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
					src: f.senderAvatar || 'https://i.pravatar.cc/300',
					alt: f.senderUsername,
					width: 35,
					height: 35,
					loading: 'lazy',
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
					acceptFriendRequest(f.senderId);
					wrapper.removeChild(friends);
					if (wrapper.childElementCount === 0) {
						wrapper.appendChild(noFriendsMessage);
					}
				});
				rejectButton.addEventListener('click', () => {
					rejectFriendRequest(f.senderId);
					wrapper.removeChild(friends);
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
	tab.appendChild(wrapper);

	return tab;
}

function AllFriendsTab() {
	const tab = Tab({
		value: 'all-friends',
		classes: ['flex', 'flex-col', 'gap-4'],
	});
	const wrapper = Wrapper({ classes: ['flex', 'flex-col', 'gap-1'] });
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
			const friend = Wrapper({
				classes: ['flex', 'items-center', 'gap-4'],
			});
			const avatar = Img({
				src: f.avatar || `https://i.pravatar.cc/30${f.id}`,
				alt: f.username,
				width: 35,
				height: 35,
				loading: 'lazy',
				classes: ['rounded-full', 'border', 'border-accent'],
			});
			const name = Text({
				element: 'span',
				content: f.username,
				classes: ['text-sm'],
			});
			const button = Button({ type: 'button', variant: 'ghost' });
			const msgIcon = Icon({
				icon: MessageCircle,
			});

			button.appendChild(msgIcon);
			friend.appendChild(avatar);
			friend.appendChild(name);
			friends.appendChild(friend);
			friends.appendChild(button);
			wrapper.appendChild(friends);
		});
	}

	searchInput.addEventListener('input', renderFriends);
	renderFriends();

	tab.appendChild(searchInput);
	tab.appendChild(wrapper);

	return tab;
}

export default function FriendsSection() {
	const section = Card({
		element: 'section',
		classes: [
			'flex',
			'flex-col',
			'gap-4',
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
				Trigger({ content: 'Requests', value: 'requests' }),
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
