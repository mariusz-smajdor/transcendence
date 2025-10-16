import { History as Clock } from 'lucide';
import { Card } from '../../../components/card.js';
import { Heading } from '../../../components/heading.js';
import { Icon } from '../../../components/icon.js';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from '../../../components/table.js';
import { Img } from '../../../components/img.js';
import { Text } from '../../../components/text.js';
import { Wrapper } from '../../../components/wrapper.js';
import {
	fetchMatchResults,
	fetchMatchStats,
	type MatchResult,
	type MatchStats,
} from '../../../api/matchResults.js';
import { getAvatarUrl } from '../../../utils/avatarUtils.js';
import { formatFullDateTime } from '../../../utils/dateFormatter.js';

export default function History(user: any) {
	const section = Card({
		element: 'section',
		classes: [
			'flex',
			'flex-col',
			'gap-4',
			'lg:gap-6',
			'w-full',
			'lg:col-span-3',
			'overflow-hidden',
		],
	});

	const heading = Heading({
		level: 2,
		content: 'Match History',
		classes: ['flex', 'items-center', 'gap-2'],
	});

	heading.prepend(
		Icon({
			icon: Clock,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		})
	);

	const wrapper = Wrapper({
		classes: ['overflow-y-auto'],
	});

	// Loading state
	const loadingDiv = document.createElement('div');
	loadingDiv.className = 'flex justify-center items-center p-8';
	loadingDiv.innerHTML =
		'<div class="text-muted">Loading match history...</div>';
	wrapper.appendChild(loadingDiv);

	// Load match history
	loadMatchHistory(wrapper, user);

	section.appendChild(heading);
	section.appendChild(wrapper);

	return section;
}

async function loadMatchHistory(wrapper: HTMLElement, user: any) {
	try {
		const [matches, stats] = await Promise.all([
			fetchMatchResults(),
			fetchMatchStats(),
		]);

		// Clear loading state
		wrapper.innerHTML = '';

		// Add stats section
		const statsSection = createStatsSection(stats);
		wrapper.appendChild(statsSection);

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

		if (matches.length === 0) {
			const emptyRow = TableRow({});
			const emptyCell = TableCell({
				content: 'No matches found',
				classes: ['text-center', 'text-muted', 'py-8'],
			});
			emptyCell.colSpan = 5;
			emptyRow.appendChild(emptyCell);
			tableBody.appendChild(emptyRow);
		} else {
			matches
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
				.forEach((match: MatchResult) => {
					const row = TableRow({});

					const opponentCell = TableCell({
						content: match.gameType === 'CPU' ? 'CPU' : match.opponent.username,
						classes: ['flex', 'items-center', 'gap-2'],
					});

					opponentCell.prepend(
						Img({
							src: getAvatarUrl(
								match.opponent.avatar,
								match.gameType === 'CPU' ? 'CPU' : match.opponent.username
							),
							classes: [
								'w-8',
								'h-8',
								'rounded-full',
								'border',
								'border-accent',
							],
							alt: 'Opponent avatar',
							loading: 'lazy',
						})
					);

					const scoreCell =
						match.winner === user.username
							? TableCell({
									content: match.score,
									classes: match.score.includes('Walkover')
										? ['text-green-400', 'font-bold']
										: ['text-green-400'],
							  })
							: TableCell({
									content: match.score.split(' - ').reverse().join(' - '),
									classes: match.score.includes('Walkover')
										? ['text-red-400', 'font-bold']
										: ['text-red-400'],
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
						content: formatFullDateTime(match.date),
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
		}

		headerRow.appendChild(opponentHeader);
		headerRow.appendChild(scoreHeader);
		headerRow.appendChild(typeHeader);
		headerRow.appendChild(dateHeader);
		headerRow.appendChild(blockchainHeader);
		tableHeader.appendChild(headerRow);
		table.appendChild(tableHeader);
		table.appendChild(tableBody);
		wrapper.appendChild(table);
	} catch (error) {
		console.error('Error loading match history:', error);
		wrapper.innerHTML = `
			<div class="flex justify-center items-center p-8">
				<div class="text-red-400">Failed to load match history</div>
			</div>
		`;
	}
}

function createStatsSection(stats: MatchStats): HTMLElement {
	const statsDiv = document.createElement('div');
	statsDiv.className = 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-6';

	const statItems = [
		{ label: 'Total Matches', value: stats.totalMatches },
		{ label: 'Wins', value: stats.wins, color: 'text-green-400' },
		{ label: 'Losses', value: stats.losses, color: 'text-red-400' },
		{ label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-blue-400' },
	];

	statItems.forEach((stat) => {
		const statDiv = document.createElement('div');
		statDiv.className = 'text-center p-4 bg-primary/10 rounded-lg';

		const valueDiv = document.createElement('div');
		valueDiv.className = `text-2xl font-bold ${stat.color || 'text-primary'}`;
		valueDiv.textContent = stat.value.toString();

		const labelDiv = document.createElement('div');
		labelDiv.className = 'text-sm text-muted mt-1';
		labelDiv.textContent = stat.label;

		statDiv.appendChild(valueDiv);
		statDiv.appendChild(labelDiv);
		statsDiv.appendChild(statDiv);
	});

	return statsDiv;
}
