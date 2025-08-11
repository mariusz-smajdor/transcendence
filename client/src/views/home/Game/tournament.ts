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

		newTournamentButton.addEventListener('click', async () => {
			const token = getCookie('access_token') ?? null;
      const sessionId = getCookie('sessionId') ?? null;
			const response = await fetch('http://localhost:3000/tournament/create',{
				 		method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							creator: "example",
							token,
							sessionId,
							numberOfPlayers: 8}),
					})
			if (!response.ok){
				 console.log(response);
			}
		});

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

		async function renderRooms() {
			const token = getCookie('access_token') ?? null;
			const sessionId = getCookie('sessionId') ?? null;
			const rooms = await fetchTournamentRooms(token,sessionId);
			tableBody.innerHTML = '';
			
				const tournaments = Array.isArray(rooms) ? rooms : [rooms];
				tournaments.forEach(room => {
					const row = TableRow({});
        	const creatorCell = TableCell({
          	content: room.creator,
          	classes: ['flex', 'items-center', 'gap-2'],
        })
        creatorCell.prepend(
            Img({
                src: room.avatar ?? 'https://i.pravatar.cc/300?u=9',
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

				joinButton.addEventListener('click',async () => {
					const response = await fetch('http://localhost:3000/tournament/join',{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							name: "example",
							token,
							sessionId,
							roomId: room.id}),
					})
					console.log(response);
				})
        
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
	renderRooms();
	setInterval(renderRooms, 2000);

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