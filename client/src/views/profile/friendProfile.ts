import { User, Mail, History, X } from 'lucide';
import { historyManager } from '../../utils/historyManager';
import { Wrapper } from '../../components/wrapper';
import { Card } from '../../components/card';
import { Icon } from '../../components/icon';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
import { Img } from '../../components/img';
import { Button } from '../../components/button';
import { getAvatarUrl } from '../../utils/avatarUtils';
import {
	fetchFriendMatchHistory,
	type MatchResult,
	type MatchStats,
} from '../../api/matchResults';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from '../../components/table';

export default function FriendProfile(
	friendId: number,
	options?: { pushState?: boolean }
) {
	const overlay = Wrapper({
		element: 'section',
		classes: [
			'fixed',
			'inset-0',
			'bg-black/50',
			'flex',
			'items-center',
			'justify-center',
			'z-50',
			'p-4',
		],
	});
	// Identify overlay for re-open logic guards
	overlay.setAttribute('data-friend-profile-modal', 'true');

	const closeModal = () => {
		overlay.remove();
		document.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('popstate', onPopState);

		// Navigate back to previous state so forward reopens the modal
		historyManager.back();
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeModal();
		}
	};

	const onPopState = () => {
		overlay.remove();
		document.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('popstate', onPopState);
	};

	document.addEventListener('keydown', onKeyDown);
	window.addEventListener('popstate', onPopState);

	// Push modal state so back/forward navigates between states, unless restored
	if (options?.pushState !== false) {
		historyManager.pushState('modal', { modal: 'friendProfile', friendId });
	}

	function FriendProfileContent() {
		const modalContainer = Wrapper({
			classes: [
				'bg-foreground',
				'rounded-2xl',
				'shadow-2xl',
				'max-w-4xl',
				'w-full',
				'max-h-[90vh]',
				'overflow-y-auto',
			],
		});

		// Modal header
		const header = document.createElement('div');
		header.className =
			'flex items-center justify-between p-6 border-b border-accent';

		const titleContainer = Wrapper({
			classes: ['flex', 'items-center', 'gap-3'],
		});

		const titleIcon = Icon({
			icon: User,
			size: 'lg',
			classes: ['text-primary', 'glow-primary-animate'],
		});

		const titleElement = Heading({
			level: 2,
			content: 'Friend Profile',
			classes: ['text-2xl', 'font-bold'],
		});

		const closeBtn = Button({
			content: '',
			variant: 'outline',
			classes: [
				'p-2',
				'rounded-full',
				'border-accent',
				'hover:border-primary',
				'transition-colors',
			],
		});

		const closeIcon = Icon({
			icon: X,
			size: 'sm',
		});

		closeBtn.appendChild(closeIcon);
		closeBtn.addEventListener('click', closeModal);

		titleContainer.appendChild(titleIcon);
		titleContainer.appendChild(titleElement);
		header.appendChild(titleContainer);
		header.appendChild(closeBtn);

		// Modal body
		const body = document.createElement('div');
		body.className = 'p-6 space-y-8';

		// Loading state
		const loadingDiv = document.createElement('div');
		loadingDiv.className = 'flex justify-center items-center p-8';
		loadingDiv.innerHTML =
			'<div class="text-muted">Loading friend profile...</div>';
		body.appendChild(loadingDiv);

		// Load friend profile
		loadFriendProfile(body, friendId);

		modalContainer.appendChild(header);
		modalContainer.appendChild(body);

		return modalContainer;
	}

	async function loadFriendProfile(container: HTMLElement, friendId: number) {
		try {
			const friendData = await fetchFriendMatchHistory(friendId);

			// Clear loading state
			container.innerHTML = '';

			// Friend header section
			const friendHeader = createFriendHeader(
				friendData.friend,
				friendData.stats
			);
			container.appendChild(friendHeader);

			// Game history section
			const gameHistory = createGameHistorySection(
				friendData.matches,
				friendData.friend.username
			);
			container.appendChild(gameHistory);
		} catch (error) {
			console.error('Error loading friend profile:', error);
			container.innerHTML = `
				<div class="flex justify-center items-center p-8">
					<div class="text-red-400">Failed to load friend profile</div>
				</div>
			`;
		}
	}

	function createFriendHeader(friend: any, stats: MatchStats | null) {
		const headerCard = Card({
			classes: [
				'flex',
				'flex-col',
				'md:flex-row',
				'items-center',
				'gap-6',
				'p-8',
				'bg-background',
				'rounded-2xl',
				'shadow-xl',
			],
		});

		const avatarSection = Wrapper({
			classes: ['flex', 'flex-col', 'items-center', 'gap-4'],
		});

		const avatarImg = Img({
			src: getAvatarUrl(friend.avatar, friend.username),
			alt: 'Friend Avatar',
			width: 120,
			height: 120,
			classes: ['rounded-full', 'border-4', 'border-accent', 'aspect-square'],
		});

		const userInfo = Wrapper({
			classes: [
				'flex',
				'flex-col',
				'items-center',
				'md:items-start',
				'gap-2',
				'flex-1',
			],
		});

		const usernameDisplay = Heading({
			level: 1,
			content: friend.username,
			classes: ['text-3xl', 'font-bold', 'text-primary'],
		});

		const emailDisplay = Wrapper({
			classes: ['flex', 'items-center', 'gap-2', 'text-muted'],
		});

		const emailIcon = Icon({
			icon: Mail,
			size: 'sm',
		});

		const emailText = Text({
			content: friend.email || 'No email',
			classes: ['text-lg'],
		});

		emailDisplay.appendChild(emailIcon);
		emailDisplay.appendChild(emailText);

		const statsSection = Wrapper({
			classes: ['flex', 'gap-6', 'mt-4'],
		});

		// This will be populated by loadFriendStats
		const statsContainer = Wrapper({
			classes: ['flex', 'gap-6'],
		});

		avatarSection.appendChild(avatarImg);
		userInfo.appendChild(usernameDisplay);
		userInfo.appendChild(emailDisplay);
		userInfo.appendChild(statsSection);
		statsSection.appendChild(statsContainer);

		headerCard.appendChild(avatarSection);
		headerCard.appendChild(userInfo);

		// Load friend stats
		if (stats) {
			loadFriendStats(statsContainer, stats);
		} else {
			const noStatsDiv = document.createElement('div');
			noStatsDiv.className = 'text-muted text-sm';
			noStatsDiv.textContent = 'No match statistics available';
			statsContainer.appendChild(noStatsDiv);
		}

		return headerCard;
	}

	function loadFriendStats(container: HTMLElement, stats: MatchStats) {
		const statItems = [
			{
				label: 'Total Matches',
				value: stats.totalMatches,
				color: 'text-primary',
			},
			{ label: 'Wins', value: stats.wins, color: 'text-green-400' },
			{ label: 'Losses', value: stats.losses, color: 'text-red-400' },
			{
				label: 'Win Rate',
				value: `${stats.winRate}%`,
				color: 'text-blue-400',
			},
		];

		statItems.forEach((stat) => {
			const statDiv = document.createElement('div');
			statDiv.className =
				'text-center p-4 bg-primary/10 rounded-lg min-w-[100px]';

			const valueDiv = document.createElement('div');
			valueDiv.className = `text-2xl font-bold ${stat.color}`;
			valueDiv.textContent = stat.value.toString();

			const labelDiv = document.createElement('div');
			labelDiv.className = 'text-sm text-muted mt-1';
			labelDiv.textContent = stat.label;

			statDiv.appendChild(valueDiv);
			statDiv.appendChild(labelDiv);
			container.appendChild(statDiv);
		});
	}

	function createGameHistorySection(
		matches: MatchResult[],
		friendUsername: string
	) {
		const historyCard = Card({
			classes: [
				'flex',
				'flex-col',
				'gap-6',
				'p-8',
				'bg-background',
				'rounded-2xl',
				'shadow-xl',
			],
		});

		const header = Wrapper({
			classes: ['flex', 'items-center', 'gap-3'],
		});

		const historyIcon = Icon({
			icon: History,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		});

		const title = Heading({
			level: 2,
			content: 'Game History',
			classes: ['text-2xl', 'font-bold'],
		});

		header.appendChild(historyIcon);
		header.appendChild(title);

		const historyContainer = Wrapper({
			classes: ['overflow-x-auto'],
		});

		if (matches.length === 0) {
			const emptyDiv = document.createElement('div');
			emptyDiv.className = 'text-center text-muted p-8';
			emptyDiv.textContent = 'No games played yet';
			historyContainer.appendChild(emptyDiv);
		} else {
			// Create table
			const table = Table({});
			const tableHeader = TableHeader({});
			const headerRow = TableRow({});

			const opponentHeader = TableHeaderCell({ content: 'Opponent' });
			const scoreHeader = TableHeaderCell({ content: 'Score' });
			const typeHeader = TableHeaderCell({ content: 'Type' });
			const dateHeader = TableHeaderCell({ content: 'Date' });
			const blockchainHeader = TableHeaderCell({ content: 'Blockchain' });

			const tableBody = TableBody({});

			matches.forEach((match: MatchResult) => {
				const row = TableRow({});

				const opponentCell = TableCell({
					content: match.opponent.username,
					classes: ['flex', 'items-center', 'gap-2'],
				});

				opponentCell.prepend(
					Img({
						src: getAvatarUrl(match.opponent.avatar, match.opponent.username),
						classes: ['w-8', 'h-8', 'rounded-full', 'border', 'border-accent'],
						alt: 'Opponent avatar',
						loading: 'lazy',
					})
				);

				const scoreCell =
					match.winner === friendUsername
						? TableCell({
								content: match.score,
								classes: ['text-green-400'],
						  })
						: TableCell({
								content: match.score.split(' - ').reverse().join(' - '),
								classes: ['text-red-400'],
						  });

				const typeSpan = Text({
					element: 'span',
					content: match.gameType,
					classes: [
						'text-xs',
						'text-primary',
						'bg-primary/25',
						'py-1',
						'px-2',
						'rounded-full',
					],
				});
				const typeCell = TableCell({});
				typeCell.appendChild(typeSpan);

				const dateCell = TableCell({
					content: new Date(match.date).toLocaleDateString(),
					classes: ['text-muted'],
				});

				const blockchainCell = TableCell({
					content: match.blockchainTx ? '✓' : '✗',
					classes: [match.blockchainTx ? 'text-green-400' : 'text-red-400'],
				});

				row.appendChild(opponentCell);
				row.appendChild(scoreCell);
				row.appendChild(typeCell);
				row.appendChild(dateCell);
				row.appendChild(blockchainCell);
				tableBody.appendChild(row);
			});

			headerRow.appendChild(opponentHeader);
			headerRow.appendChild(scoreHeader);
			headerRow.appendChild(typeHeader);
			headerRow.appendChild(dateHeader);
			headerRow.appendChild(blockchainHeader);
			tableHeader.appendChild(headerRow);
			table.appendChild(tableHeader);
			table.appendChild(tableBody);
			historyContainer.appendChild(table);
		}

		historyCard.appendChild(header);
		historyCard.appendChild(historyContainer);

		return historyCard;
	}

	// Add click outside to close
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			closeModal();
		}
	});

	overlay.appendChild(FriendProfileContent());
	return overlay;
}
