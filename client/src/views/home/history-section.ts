import { History } from 'lucide';
import { Card } from '../../components/card.js';
import { Heading } from '../../components/heading.js';
import { Icon } from '../../components/icon.js';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from '../../components/table.js';
import { Img } from '../../components/img.js';
import { Text } from '../../components/text.js';
import { Wrapper } from '../../components/wrapper.js';

////////////////
const user = {
	name: 'John Doe',
	avatar: 'https://i.pravatar.cc/300?u=john',
};

const history = [
	{
		player1: user,
		player2: {
			name: 'Bot Krzysiek',
			avatar: 'https://i.pravatar.cc/300?u=bot1',
		},
		winner: 'John Doe',
		date: '2023-10-01',
		score: '5 - 3',
		type: 'CPU',
	},
	{
		player1: { name: 'AI Jacek', avatar: 'https://i.pravatar.cc/300?u=bot2' },
		player2: user,
		winner: 'AI Jacek',
		date: '2023-10-02',
		score: '5 - 3',
		type: 'CPU',
	},
	{
		player1: user,
		player2: {
			name: 'Wirtualna Magda',
			avatar: 'https://i.pravatar.cc/300?u=bot3',
		},
		winner: 'John Doe',
		date: '2023-10-03',
		score: '5 - 2',
		type: 'CPU',
	},
	{
		player1: {
			name: 'Komputer Tomek',
			avatar: 'https://i.pravatar.cc/300?u=bot4',
		},
		player2: user,
		winner: 'John Doe',
		date: '2023-10-04',
		score: '5 - 2',
		type: 'CPU',
	},
	{
		player1: user,
		player2: {
			name: 'Maciej Pawian',
			avatar: 'https://i.pravatar.cc/300?u=maciej',
		},
		winner: 'John Doe',
		date: '2023-10-05',
		score: '5 - 4',
		type: 'Duel',
	},
	{
		player1: {
			name: 'Filip i Filip',
			avatar: 'https://i.pravatar.cc/300?u=filip',
		},
		player2: user,
		winner: 'Filip i Filip',
		date: '2023-10-06',
		score: '5 - 3',
		type: 'Duel',
	},
	{
		player1: user,
		player2: { name: 'CPU Piotr', avatar: 'https://i.pravatar.cc/300?u=bot5' },
		winner: 'John Doe',
		date: '2023-10-07',
		score: '5 - 1',
		type: 'CPU',
	},
	{
		player1: { name: 'WowaPL', avatar: 'https://i.pravatar.cc/300?u=wowa' },
		player2: user,
		winner: 'John Doe',
		date: '2023-10-08',
		score: '5 - 2',
		type: 'Duel',
	},
	{
		player1: user,
		player2: {
			name: 'Maciej Pawian',
			avatar: 'https://i.pravatar.cc/300?u=maciej2',
		},
		winner: 'Maciej Pawian',
		date: '2023-10-09',
		score: '5 - 4',
		type: 'Duel',
	},
	{
		player1: { name: 'Bot Janka', avatar: 'https://i.pravatar.cc/300?u=bot6' },
		player2: user,
		winner: 'John Doe',
		date: '2023-10-10',
		score: '5 - 3',
		type: 'CPU',
	},
];
/////////////////

export default function HistorySection(user: any) {
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
			icon: History,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		})
	);
	const wrapper = Wrapper({
		classes: ['overflow-y-auto'],
	});
	const table = Table({});
	const tableHeader = TableHeader({});
	const headerRow = TableRow({});
	const oponentHeader = TableHeaderCell({ content: 'Opponent' });
	const scoreHeader = TableHeaderCell({ content: 'Score' });
	const typeHeader = TableHeaderCell({ content: 'Type' });
	const dateHeader = TableHeaderCell({ content: 'Date' });
	const tableBody = TableBody({});
	history.forEach((match) => {
		const row = TableRow({});
		const oponentCell = TableCell({
			content:
				match.player1.name === user.name
					? match.player2.name
					: match.player1.name,
			classes: ['flex', 'items-center', 'gap-2'],
		});
		oponentCell.prepend(
			Img({
				src:
					match.player1.name === user.name
						? match.player2.avatar
						: match.player1.avatar,
				classes: ['w-8', 'h-8', 'rounded-full', 'border', 'border-accent'],
				alt: 'Opponent avatar',
				loading: 'lazy',
			})
		);
		const scoreCell =
			match.winner === user.name
				? TableCell({
						content: match.score,
						classes: ['text-green-400'],
				  })
				: TableCell({
						content: match.score.split('').reverse().join(''),
						classes: ['text-red-400'],
				  });
		const typeSpan = Text({
			element: 'span',
			content: match.type,
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
		typeCell.prepend(typeSpan);
		const dateCell = TableCell({
			content: match.date,
			classes: ['text-muted'],
		});

		row.appendChild(oponentCell);
		row.appendChild(scoreCell);
		row.appendChild(typeCell);
		row.appendChild(dateCell);
		tableBody.appendChild(row);
	});

	headerRow.appendChild(oponentHeader);
	headerRow.appendChild(scoreHeader);
	headerRow.appendChild(typeHeader);
	headerRow.appendChild(dateHeader);
	tableHeader.appendChild(headerRow);
	table.appendChild(tableHeader);
	table.appendChild(tableBody);
	wrapper.appendChild(table);
	section.appendChild(heading);
	section.appendChild(wrapper);

	return section;
}
