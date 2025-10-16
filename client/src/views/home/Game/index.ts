import { Gamepad2, Users, Bot } from 'lucide';
import { Tabs, Trigger, Tab } from '../../../components/tabs';
import { Wrapper } from '../../../components/wrapper';
import { Card } from '../../../components/card';
import { Heading } from '../../../components/heading';
import { Icon } from '../../../components/icon';
import { Text } from '../../../components/text';
import { showGameOverlay } from '../../game/game-overlay';
import { TournamentTab } from './tournament';
import { t } from '../../../services/i18n';

function FriendCard() {
	const card = Card({
		classes: [
			'flex',
			'gap-2',
			'justify-center',
			'items-center',
			'row-span-2',
			'col-span-2',
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
		content: t('game.friend.heading'),
		classes: ['text-[1rem]'],
	});
	heading.setAttribute('data-i18n', 'game.friend.heading');
	const friendTextSpan = document.createElement('span');
	friendTextSpan.setAttribute('data-i18n-text', '');
	friendTextSpan.textContent = t('game.friend.heading');
	heading.innerHTML = '';
	heading.appendChild(friendTextSpan);
	const description = Text({
		element: 'p',
		content: t('game.friend.desc'),
		classes: ['text-sm', 'text-muted', 'text-center'],
	});
	description.setAttribute('data-i18n', 'game.friend.desc');

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
		content: t('game.ai.heading'),
		classes: ['text-[1rem]'],
	});
	heading.setAttribute('data-i18n', 'game.ai.heading');
	const aiTextSpan = document.createElement('span');
	aiTextSpan.setAttribute('data-i18n-text', '');
	aiTextSpan.textContent = t('game.ai.heading');
	heading.innerHTML = '';
	heading.appendChild(aiTextSpan);
	const description = Text({
		element: 'p',
		content: t('game.ai.desc'),
		classes: ['text-sm', 'text-muted'],
	});
	description.setAttribute('data-i18n', 'game.ai.desc');

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
			'flex',
			'flex-col',
			// 'grid',
			// 'grid-rows-5',
			// 'grid-cols-2',
			'gap-4',
			'h-full',
			'lg:gap-6',
		],
	});
	const friendCard = FriendCard();
	const aiCard = AiCard();

	tab.appendChild(friendCard);
	tab.appendChild(aiCard);

	return tab;
}

export default function Game() {
	const section = Card({
		element: 'section',
		classes: ['flex', 'flex-col', 'gap-4', 
			'lg:col-span-3', 
			'lg:gap-6'
		],
	});
	const heading = Heading({
		level: 2,
		content: t('game.heading'),
		classes: ['flex', 'items-center', 'gap-2'],
	});
	heading.setAttribute('data-i18n', 'game.heading');
	const gameTextSpan = document.createElement('span');
	gameTextSpan.setAttribute('data-i18n-text', '');
	gameTextSpan.textContent = t('game.heading');
	heading.innerHTML = '';
	heading.appendChild(gameTextSpan);

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
				(() => {
					const tr = Trigger({
						content: t('game.quickPlay'),
						value: 'quick-play',
					});
					tr.setAttribute('data-i18n', 'game.quickPlay');
					return tr;
				})(),
				(() => {
					const tr = Trigger({
						content: t('game.tournament'),
						value: 'tournament',
					});
					tr.setAttribute('data-i18n', 'game.tournament');
					return tr;
				})(),
			],
			tabs: [QuickPlayTab(), TournamentTab()],
			classes: ['h-full'],
			enableHistory: true,
			tabGroupId: 'game-tabs',
			tabUrls: {
				'quick-play': '/play',
				'tournament': '/tournament',
			},
		})
	);

	return section;
}
