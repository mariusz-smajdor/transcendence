import { Button } from '../../../../components/button.js';
import { Card } from '../../../../components/card';
import { Heading } from '../../../../components/heading';
import { Icon } from '../../../../components/icon';
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from '../../../../components/table.js';
import { Img } from '../../../../components/img.js';
import { Wrapper } from '../../../../components/wrapper.js';
import { Trophy } from 'lucide';
// Tournament list component

interface TournamentRoom {
	id: string;
	creator: string;
	avatar?: string;
	playersIn: number;
	playersExpected: number;
}

interface TournamentListProps {
	onCreateTournament: () => void;
	onJoinTournament: (room: TournamentRoom) => void;
	onRefresh: () => void;
}

export function TournamentList({
	onCreateTournament,
	onJoinTournament,
	onRefresh,
}: TournamentListProps) {
	const card = Card({
		classes: [
			'flex',
			'flex-col',
			'gap-4',
			'bg-background',
			'lg:gap-6',
			'overflow-y-auto',
			'max-h-160',
		],
	});
	card.classList.remove('bg-foreground');

	const heading = Heading({
		level: 2,
		content: 'Tournament',
		classes: ['flex', 'items-center', 'gap-2'],
	});
	heading.prepend(
		Icon({
			icon: Trophy,
			size: 'lg',
			classes: ['text-secondary', 'glow-secondary-animate'],
		})
	);

	const buttonWrapper = Wrapper({
		element: 'div',
		classes: ['flex', 'gap-2'],
	});

	const newTournamentButton = Button({
		variant: 'primary',
		content: 'New Tournament',
	});

	const refreshButton = Button({
		variant: 'outline',
		content: 'Refresh',
	});

	newTournamentButton.addEventListener('click', onCreateTournament);
	refreshButton.addEventListener('click', onRefresh);

	buttonWrapper.appendChild(newTournamentButton);
	buttonWrapper.appendChild(refreshButton);

	const wrapper = Wrapper({
		element: 'div',
		classes: ['flex', 'justify-between'],
	});
	wrapper.appendChild(heading);
	wrapper.appendChild(buttonWrapper);

	const table = Table({});
	const tableHeader = TableHeader({});
	const headerRow = TableRow({});
	const creatorHeader = TableHeaderCell({ content: 'Creator' });
	const playersHeader = TableHeaderCell({ content: 'Players' });
	const joinHeader = TableHeaderCell({ content: 'Join' });
	const tableBody = TableBody({});

	headerRow.appendChild(creatorHeader);
	headerRow.appendChild(playersHeader);
	headerRow.appendChild(joinHeader);
	tableHeader.appendChild(headerRow);
	table.appendChild(tableHeader);
	table.appendChild(tableBody);

	card.appendChild(wrapper);
	card.appendChild(table);

	// Store reference to tableBody for external updates
	(card as any).renderRooms = async (rooms: TournamentRoom[]) => {
		tableBody.innerHTML = '';
		rooms.forEach((room) => {
			const row = TableRow({});
			const creatorCell = TableCell({
				content: room.creator,
				classes: ['flex', 'items-center', 'gap-2'],
			});
			creatorCell.prepend(
				Img({
					src: room.avatar ?? 'https://i.pravatar.cc/300?u=9',
					classes: ['w-8', 'h-8', 'rounded-full', 'border', 'border-accent'],
					alt: 'Creator avatar',
					loading: 'lazy',
				})
			);

			const playersCell = TableCell({
				content: `${room.playersIn}/${room.playersExpected}`,
			});

			const joinButton = Button({
				variant: 'tab',
				content: 'join',
			});

			joinButton.addEventListener('click', () => onJoinTournament(room));

			const joinCell =
				room.playersIn === room.playersExpected
					? TableCell({ content: 'full' })
					: TableCell({});

			if (room.playersIn !== room.playersExpected) {
				joinCell.appendChild(joinButton);
			}

			row.appendChild(creatorCell);
			row.appendChild(playersCell);
			row.appendChild(joinCell);
			tableBody.appendChild(row);
		});
	};

	return card;
}
