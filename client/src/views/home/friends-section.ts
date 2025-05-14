import { MessageCircle, UserPlus, Users } from 'lucide';
import { Wrapper } from '../../components/wrapper';
import { Card } from '../../components/card';
import { Heading } from '../../components/heading';
import { Icon } from '../../components/icon';
import { Tabs, Tab, Trigger } from '../../components/tabs';
import { Input } from '../../components/input';
import { Img } from '../../components/img';
import { Text } from '../../components/text';
import { Button } from '../../components/button';

///// TEMPORARY HARDCODED FRIENDS, LATER WE WILL GET HIM FROM BACKEND

const FRIENDS = [
	{
		name: 'John Doe',
		avatar: 'https://i.pravatar.cc/300',
	},
	{
		name: 'Jane Doe',
		avatar: 'https://i.pravatar.cc/301',
	},
	{
		name: 'John Smith',
		avatar: 'https://i.pravatar.cc/302',
	},
	{
		name: 'Jane Smith',
		avatar: 'https://i.pravatar.cc/303',
	},
];

/////

function addFriendHandler(e: Event, friendInput: HTMLInputElement) {
	e.preventDefault();

	const friendUsername = friendInput.value.trim();

	if (!friendUsername) {
		friendInput.focus();
		return;
	}

	// call api to add friend
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
		const value = searchInput.value.trim().toLowerCase();

		const filteredFriends = FRIENDS.filter((f) => {
			if (!value) return true;
			return f.name.toLowerCase().includes(value);
		});

		wrapper.innerHTML = '';

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
				src: f.avatar,
				alt: f.name,
				width: 35,
				height: 35,
				loading: 'lazy',
				classes: ['rounded-full', 'border', 'border-accent'],
			});
			const name = Text({
				element: 'span',
				content: f.name,
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

	form.addEventListener('submit', (e) => addFriendHandler(e, friendUsername));

	renderFriends();
	addFriend.prepend(addIcon);
	form.appendChild(addFriend);
	form.appendChild(friendUsername);
	tab.appendChild(searchInput);
	tab.appendChild(wrapper);
	tab.appendChild(form);

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
			tabs: [AllFriendsTab(), Wrapper({})],
			classes: ['h-full'],
		})
	);

	return section;
}
