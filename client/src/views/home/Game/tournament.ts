import { Trophy } from 'lucide';
import { Tab } from '../../../components/tabs';
import { Button } from '../../../components/button.js';
import { Card } from '../../../components/card';
import { Heading } from '../../../components/heading';
import { Icon } from '../../../components/icon';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '../../../components/table.js';
import { Img } from '../../../components/img.js';
import { Wrapper } from '../../../components/wrapper.js';
import { getCookie } from '../../game/game-cookies.js';

const tournaments = [
    {
        creator: 'Bot Krzysiek',
        avatar: 'https://i.pravatar.cc/300?u=bot1',
        players: '3',
        maxPlayers: '4'
    },
    {
        creator: 'Wirtualna Magda',
        avatar: 'https://i.pravatar.cc/300?u=bot3',
        players: '8',
        maxPlayers: '8'
    },
    {
        creator: 'Filip i Filip',
        avatar: 'https://i.pravatar.cc/300?u=filip',
        players: '4',
        maxPlayers: '4'
    },
    {
        creator: 'Maciej Pawian',
        avatar: 'https://i.pravatar.cc/300?u=maciej2',
        players: '1',
        maxPlayers: '4'
    },
    {
        creator: 'WowaPL',
        avatar: 'https://i.pravatar.cc/300?u=wowa',
        players: '3',
        maxPlayers: '8'
    },
    {
        creator: 'Mario',
        avatar: 'https://i.pravatar.cc/300?u=mario',
        players: '8',
        maxPlayers: '8'
    },
];


export function TournamentTab() {
    const tab = Tab({
        value: 'tournament',
    });
    
    const card = Card({
        classes: [
            'flex',
            'flex-col',
            'gap-4',
            'bg-background',
            'lg:gap-6',
            'overflow-y-auto',
            'max-h-160'
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

    const newTournamentButton = Button({
        variant: 'primary',
        content: 'New Tournament',
    });

		(async () => {
        const token = getCookie('access_token') ?? null;
        const sessionId = getCookie('session') ?? null;
        const rooms = await fetchTournamentRooms(token, sessionId);
        console.log(rooms);

				rooms.forEach(room => {
					const row = TableRow({});
        	const creatorCell = TableCell({
          	content: room.creator,
          	classes: ['flex', 'items-center', 'gap-2'],
        })
        creatorCell.prepend(
            Img({
                src: 'https://i.pravatar.cc/300?u=mario',
                classes: ['w-8', 'h-8', 'rounded-full', 'border', 'border-accent'],
                alt: 'Creator avatar',
                loading: 'lazy',
            })
					);
        const playersCell = TableCell({
            content: `${room.playersIn}/${room.playersExpected}`
        });

        const joinButton = Button({
            variant: 'tab',
            content: 'join'
        });
        
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
	})();

    const wrapper = Wrapper({
        element: 'div',
        classes: ['flex', 'justify-between'],
    });
    wrapper.appendChild(heading);
    wrapper.appendChild(newTournamentButton);

    const table = Table({});
    const tableHeader = TableHeader({});
    const headerRow = TableRow({});
    const creatorHeader = TableHeaderCell({ content: 'Creator' });
    const playersHeader = TableHeaderCell({ content: 'Players' });
    const joinHeader = TableHeaderCell({ content: 'Join' });
    const tableBody = TableBody({});
    /*tournaments.forEach((tournament) => {
        const row = TableRow({});
        const creatorCell = TableCell({
            content: tournament.creator,
            classes: ['flex', 'items-center', 'gap-2'],
        });
        creatorCell.prepend(
            Img({
                src: tournament.avatar,
                classes: ['w-8', 'h-8', 'rounded-full', 'border', 'border-accent'],
                alt: 'Creator avatar',
                loading: 'lazy',
            })
        )
        const playersCell = TableCell({
            content: `${tournament.players}/${tournament.maxPlayers}`
        });

        const joinButton = Button({
            variant: 'tab',
            content: 'join'
        });
        
        const joinCell =
            tournament.players === tournament.maxPlayers
                ? TableCell({ content: 'full' })
                : TableCell({});
        
        if (tournament.players !== tournament.maxPlayers) {
            joinCell.appendChild(joinButton);
        }

        row.appendChild(creatorCell);
        row.appendChild(playersCell);
        row.appendChild(joinCell);
        tableBody.appendChild(row);
    });*/

    headerRow.appendChild(creatorHeader);
    headerRow.appendChild(playersHeader);
    headerRow.appendChild(joinHeader);
    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);
    table.appendChild(tableBody);

    card.appendChild(wrapper);
    card.appendChild(table);
    tab.appendChild(card);

    return tab;
}

async function fetchTournamentRooms(token: string | null, sessionId: string | null){
	const response = await fetch('http://localhost:3000/tournament/rooms',{
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({token, sessionId}),
	});
	return await response.json();
}