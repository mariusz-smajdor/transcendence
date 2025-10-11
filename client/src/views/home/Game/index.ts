import { Gamepad2, Users, Bot } from 'lucide';
import { Tabs, Trigger, Tab } from '../../../components/tabs';
import { Wrapper } from '../../../components/wrapper';
import { Card } from '../../../components/card';
import { Heading } from '../../../components/heading';
import { Icon } from '../../../components/icon';
import { Text } from '../../../components/text';
import { showGameOverlay } from '../../game/game-overlay';
import { showLobbyOverlay } from '../../game//lobby-overlay';
import { fetchMe } from '../../../api/me';
import { TournamentTab } from './tournament';

function FriendCard() {
	const card = Card({
		classes: [
			'flex',
			'gap-2',
			'flex-col',
			'justify-center',
			'items-center',
			'row-span-3',
			'col-span-1',
			'h-full',
			'hover:border-primary',
			'cursor-pointer',
			'lg:gap-4',
		],
	});
	const iconWrapper = Wrapper({
		classes: [
			'flex',
			'justify-center',
			'items-center',
			'bg-primary/25',
			'w-min',
			'p-3',
			'rounded-full',
		],
	});
	const icon = Icon({
		icon: Users,
		size: 'lg',
		classes: ['text-primary'],
	});
	const wrapper = Wrapper({});
	const heading = Heading({
		level: 3,
		content: 'Play with Friend',
		classes: ['text-[1rem]', 'text-center'],
	});
	const description = Text({
		element: 'p',
		content: 'Challenge your friend on the same device',
		classes: ['text-sm', 'text-muted', 'text-center'],
	});

	card.addEventListener('click', async () => {
		const response = await fetch('/api/game/create');
		const data = await response.json();
		showGameOverlay(data.gameId, 'local');
	});

	iconWrapper.appendChild(icon);
	wrapper.appendChild(heading);
	wrapper.appendChild(description);
	card.appendChild(iconWrapper);
	card.appendChild(wrapper);

	return card;
}

function OnlineCard() {
	const card = Card({
		classes: [
			'flex',
			'gap-2',
			'flex-col',
			'justify-center',
			'items-center',
			'row-span-3',
			'col-span-1',
			'h-full',
			'lg:gap-4',
		],
	});
	const iconWrapper = Wrapper({
		classes: [
			'flex',
			'justify-center',
			'items-center',
			'bg-primary/25',
			'w-min',
			'p-3',
			'rounded-full',
		],
	});
	const icon = Icon({
		icon: Gamepad2,
		size: 'lg',
		classes: ['text-primary'],
	});
	const wrapper = Wrapper({});
	const heading = Heading({
		level: 3,
		content: '1v1 Online Match',
		classes: ['text-[1rem]', 'text-center'],
	});
	const description = Text({
		element: 'p',
		content: 'Challenge your friend online',
		classes: ['text-sm', 'text-muted', 'text-center'],
	});
	
	// Check authentication status immediately and update UI accordingly
	(async () => {
		const isLoggedIn = await fetchMe();
		if (isLoggedIn) {
			// Enable the card for logged-in users
			card.classList.add('hover:border-primary', 'cursor-pointer');
			
			card.addEventListener('click', () => {
				showLobbyOverlay();
			});
		} else {
			// Disable the card for non-authenticated users
			card.classList.add('opacity-50', 'cursor-not-allowed');
			
			// Add a tooltip or message indicating login requirement
			const loginMessage = Text({
				element: 'p',
				content: 'Login required',
				classes: ['text-xs', 'text-red-400', 'mt-1'],
			});
			wrapper.appendChild(loginMessage);
		}
	})();

	iconWrapper.appendChild(icon);
	wrapper.appendChild(heading);
	wrapper.appendChild(description);
	card.appendChild(iconWrapper);
	card.appendChild(wrapper);

	return card;
}

function AiCard() {
	const card = Card({
		classes: [
			'flex',
			'gap-4',
			'justify-center',
			'items-center',
			'row-span-2',
			'col-span-2',
			'h-full',
			'hover:border-primary',
			'cursor-pointer',
		],
	});
	const iconWrapper = Wrapper({
		classes: [
			'flex',
			'justify-center',
			'items-center',
			'bg-primary/25',
			'w-min',
			'p-3',
			'rounded-full',
		],
	});
	const icon = Icon({
		icon: Bot,
		size: 'lg',
		classes: ['text-primary'],
	});
	const wrapper = Wrapper({});
	const heading = Heading({
		level: 3,
		content: 'Play with AI',
		classes: ['text-[1rem]'],
	});
	const description = Text({
		element: 'p',
		content: 'Challenge AI on the same device',
		classes: ['text-sm', 'text-muted'],
	});

	card.addEventListener('click', async () => {
		const response = await fetch('/api/game/create');
		const data = await response.json();
		showGameOverlay(data.gameId, 'ai');
	});

	iconWrapper.appendChild(icon);
	wrapper.appendChild(heading);
	wrapper.appendChild(description);
	card.appendChild(iconWrapper);
	card.appendChild(wrapper);

	return card;
}

function QuickPlayTab() {
	const tab = Tab({
		value: 'quick-play',
		classes: [
			'grid',
			'grid-rows-5',
			'grid-cols-2',
			'gap-4',
			'h-full',
			'lg:gap-6',
		],
	});
	const friendCard = FriendCard();
	const onlineCard = OnlineCard();
	const aiCard = AiCard();

	tab.appendChild(friendCard);
	tab.appendChild(onlineCard);
	tab.appendChild(aiCard);

	return tab;
}

export default function Game() {
	const section = Card({
		element: 'section',
		classes: ['flex', 'flex-col', 'gap-4', 'lg:col-span-3', 'lg:gap-6'],
	});
	const heading = Heading({
		level: 2,
		content: 'Play Pong',
		classes: ['flex', 'items-center', 'gap-2'],
	});

	heading.prepend(
		Icon({
			icon: Gamepad2,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		})
	);
	section.appendChild(heading);
	section.appendChild(
		Tabs({
			defaultValue: 'quick-play',
			triggers: [
				Trigger({ content: 'Quick Play', value: 'quick-play' }),
				Trigger({ content: 'Tournament', value: 'tournament' }),
			],
			tabs: [QuickPlayTab(), TournamentTab()],
			classes: ['h-full'],
			syncWithUrl: true,
			urlParam: 'gameTab',
		})
	);

	return section;
}
