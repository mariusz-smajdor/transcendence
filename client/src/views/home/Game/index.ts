import { Gamepad2, Users, Bot, Trophy } from 'lucide';
import { Tabs, Trigger, Tab } from '../../../components/tabs';
import { Wrapper } from '../../../components/wrapper';
import { Card } from '../../../components/card';
import { Heading } from '../../../components/heading';
import { Icon } from '../../../components/icon';
import { Text } from '../../../components/text';
import { showGameOverlay } from '../../game/game-overlay';
import { showLobbyOverlay } from '../../game//lobby-overlay';
import { fetchMe } from '../../../api/me';

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
		const response = await fetch('http://localhost:3000/game/create');
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

	card.addEventListener('click', async () => {
		const isLoggedIn = await fetchMe();
		if (isLoggedIn) {
			showLobbyOverlay();
		} else {
			const response = await fetch('http://localhost:3000/game/create');
			const respData = await response.json();
			showGameOverlay(respData.gameId, 'network');
			const newUrl = `/game?gameId=${respData.gameId}`;
			history.pushState({ gameId: respData.gameId }, `Game ${respData.gameId}`, newUrl);
		}
	});

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
		const response = await fetch('http://localhost:3000/game/create');
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

function TournamentTab() {
	const tab = Tab({
		value: 'tournament',
		classes: ['h-full'],
	});
	const card = Card({
		classes: [
			'flex',
			'flex-col',
			'justify-center',
			'items-center',
			'gap-4',
			'h-full',
			'bg-background',
			'lg:gap-6',
		],
	});
	const iconWrapper = Wrapper({
		classes: [
			'flex',
			'justify-center',
			'items-center',
			'bg-secondary/25',
			'w-min',
			'p-4',
			'rounded-full',
		],
	});
	const icon = Icon({
		icon: Trophy,
		size: 'xl',
		classes: ['text-secondary', 'glow-secondary-animate'],
	});
	const textWrapper = Wrapper({ classes: ['flex', 'flex-col', 'gap-1'] });
	const heading = Heading({
		level: 3,
		content: 'Super Tournament',
		classes: ['text-center'],
	});
	const description = Text({
		element: 'p',
		content: 'Compete against other players in a tournament format.',
		classes: ['text-sm', 'text-muted', 'text-center'],
	});
	const buttonWraper = Wrapper({
		classes: ['flex', 'gap-2', 'w-full', 'justify-center'],
	});

	card.classList.remove('bg-foreground');
	textWrapper.appendChild(heading);
	textWrapper.appendChild(description);
	iconWrapper.appendChild(icon);
	buttonWraper.appendChild(
		Text({
			content: 'You must be authenticated to participate in a tournament!',
			classes: ['text-secondary', 'text-center', 'font-bold'],
		})
	);
	card.appendChild(iconWrapper);
	card.appendChild(textWrapper);
	card.appendChild(buttonWraper);

	tab.appendChild(card);

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
		})
	);

	return section;
}
