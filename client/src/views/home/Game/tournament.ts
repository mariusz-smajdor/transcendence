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
import { Toaster } from '../../../components/toaster.js';
import { getCookie } from '../../game/game-cookies.js';
import { showGameOverlay } from '../../game/game-overlay.js';

let currentRoomId: string | null = null;

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
			'max-h-160',
		],
	});
	card.classList.remove('bg-foreground');

	async function renderTournamentList() {
		card.innerHTML = '';

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

		newTournamentButton.addEventListener('click', () => {
			renderCreateForm();
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

		headerRow.appendChild(creatorHeader);
		headerRow.appendChild(playersHeader);
		headerRow.appendChild(joinHeader);
		tableHeader.appendChild(headerRow);
		table.appendChild(tableHeader);
		table.appendChild(tableBody);

		card.appendChild(wrapper);
		card.appendChild(table);

		async function renderRooms() {
			tableBody.innerHTML = '';
			const token = getCookie('access_token') ?? null;
			const sessionId = getCookie('sessionId') ?? null;
			const rooms = await fetchTournamentRooms(token, sessionId);
			if (rooms.found && rooms.id) {
				currentRoomId = rooms.id;
				renderBracketCanvas(rooms.playersExpected, rooms.playersIn, rooms);
				return;
			} else currentRoomId = null;
			const tournaments = Array.isArray(rooms) ? rooms : [rooms];
			if (tournaments.length === 0) {
				const noTournamentsRow = TableRow({});
				const noTournamentsCell = TableCell({
					content: 'No tournaments found',
					classes: ['text-center', 'text-muted', 'py-8'],
				});
				noTournamentsCell.setAttribute('colspan', '3');
				noTournamentsRow.appendChild(noTournamentsCell);
				tableBody.appendChild(noTournamentsRow);
				return;
			}
			tournaments.forEach((room) => {
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

				joinButton.addEventListener('click', async () => {
					const response = await fetch(
						'http://localhost:3000/tournament/join',
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								name: 'example',
								token,
								sessionId,
								roomId: room.id,
							}),
						}
					);
					const data = await response.json();
					console.log(data);
					if (response.ok)
						renderBracketCanvas(data.playersExpected, data.playersIn, data);
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
		}
		renderRooms();
		setInterval(renderRooms, 2000);
	}
	function renderCreateForm() {
		card.innerHTML = '';
		const formWrapper = document.createElement('div');
		formWrapper.classList.add(
			'flex',
			'flex-col',
			'gap-4',
			'items-center',
			'justify-center',
			'py-8'
		);

		const title = document.createElement('div');
		title.textContent = 'Select number of players';
		title.classList.add('font-bold', 'mb-2');

		const token = getCookie('access_token') ?? null;
		const sessionId = getCookie('sessionId') ?? null;
		const isLoggedIn = !!token && !!sessionId;

		let nicknameInput: HTMLInputElement | null = null;

		if (!isLoggedIn) {
			const nicknameWrapper = document.createElement('div');
			nicknameWrapper.classList.add(
				'flex',
				'flex-col',
				'gap-2',
				'w-full',
				'max-w-md'
			);

			const nicknameLabel = document.createElement('label');
			nicknameLabel.textContent = 'Enter your nickname:';
			nicknameLabel.classList.add('text-sm', 'font-medium');

			nicknameInput = document.createElement('input');
			nicknameInput.type = 'text';
			nicknameInput.placeholder = 'Nickname';
			nicknameInput.classList.add('border', 'rounded', 'p-2', 'w-full');
			nicknameInput.maxLength = 20;

			nicknameWrapper.appendChild(nicknameLabel);
			nicknameWrapper.appendChild(nicknameInput);
			formWrapper.appendChild(nicknameWrapper);
		}

		const select = document.createElement('select');
		select.classList.add('border', 'rounded', 'p-2');
		[4, 8].forEach((num) => {
			const option = document.createElement('option');
			option.value = num.toString();
			option.textContent = num.toString();
			select.appendChild(option);
		});

		const buttons = document.createElement('div');
		buttons.classList.add('flex', 'gap-2', 'justify-end');

		const confirmBtn = document.createElement('button');
		confirmBtn.textContent = 'Create';
		confirmBtn.classList.add('btn', 'btn-primary', 'px-4', 'py-2');

		const cancelBtn = document.createElement('button');
		cancelBtn.textContent = 'Cancel';
		cancelBtn.classList.add('btn', 'btn-secondary', 'px-4', 'py-2');

		buttons.appendChild(confirmBtn);
		buttons.appendChild(cancelBtn);

		formWrapper.appendChild(title);
		formWrapper.appendChild(select);
		formWrapper.appendChild(buttons);
		card.appendChild(formWrapper);

		cancelBtn.onclick = () => {
			renderTournamentList();
		};

		confirmBtn.onclick = async () => {
			let creator = 'example';
			if (!isLoggedIn) {
				const nickname = nicknameInput?.value.trim();
				if (!nickname) {
					nicknameInput?.classList.add('border-red-500');
					nicknameInput?.focus();
					return;
				}
				creator = nickname;
			}

			const numberOfPlayers = parseInt(select.value, 10);
			let response = await fetch('http://localhost:3000/tournament/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					creator,
					token,
					sessionId,
					numberOfPlayers,
				}),
			});
			if (!response.ok) {
				console.log(response);
			}
			response = await response.json();
			renderBracketCanvas(numberOfPlayers, 1, response);
		};
	}

	function renderBracketCanvas(
		numberOfPlayers: number,
		playersIn: number,
		response: any
	) {
		//console.log(response)
		const players = response.positions ?? [];
		card.innerHTML = '';
		const wrapper = document.createElement('div');
		wrapper.classList.add(
			'flex',
			'flex-col',
			'items-center',
			'justify-center',
			'gap-6',
			'py-8'
		);

		const title = document.createElement('div');
		title.textContent = `Tournament bracket (${playersIn}/${numberOfPlayers} players)`;
		title.classList.add('font-bold', 'mb-4', 'text-lg');
		wrapper.appendChild(title);

		const canvas = document.createElement('canvas');
		if (numberOfPlayers === 4) {
			canvas.width = 500;
			canvas.height = 300;
		} else if (numberOfPlayers === 8) {
			canvas.width = 700;
			canvas.height = 400;
		} else {
			canvas.width = 400;
			canvas.height = 200;
		}
		canvas.style.background = '#18181b';
		canvas.style.borderRadius = '8px';
		canvas.style.border = '1px solid #444';

		const ctx = canvas.getContext('2d')!;
		ctx.font = '16px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = '#888';
		ctx.fillStyle = '#fff';

		if (numberOfPlayers === 4) {
			ctx.strokeRect(30, 40, 100, 40);
			ctx.strokeRect(30, 160, 100, 40);
			ctx.fillText(players[0] ?? 'Player 1', 80, 60);
			ctx.fillText(players[1] ?? 'Player 2', 80, 180);

			ctx.strokeRect(30, 220, 100, 40);
			ctx.strokeRect(30, 100, 100, 40);
			ctx.fillText(players[2] ?? 'Player 3', 80, 240);
			ctx.fillText(players[3] ?? 'Player 4', 80, 120);

			ctx.strokeRect(180, 90, 100, 40);
			ctx.fillText('Winner SF1', 230, 110);

			ctx.strokeRect(180, 150, 100, 40);
			ctx.fillText('Winner SF2', 230, 170);

			ctx.beginPath();
			ctx.moveTo(130, 60);
			ctx.lineTo(180, 110);
			ctx.stroke();
			ctx.moveTo(130, 180);
			ctx.lineTo(180, 110);
			ctx.stroke();
			ctx.moveTo(130, 120);
			ctx.lineTo(180, 170);
			ctx.stroke();
			ctx.moveTo(130, 240);
			ctx.lineTo(180, 170);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(280, 110);
			ctx.lineTo(350, 170);
			ctx.stroke();
			ctx.moveTo(280, 170);
			ctx.lineTo(350, 170);
			ctx.stroke();

			ctx.strokeRect(350, 150, 100, 40);
			ctx.fillText('Winner', 400, 170);
		} else if (numberOfPlayers === 8) {
			for (let i = 0; i < 8; i++) {
				ctx.strokeRect(30, 30 + i * 45, 100, 40);
				ctx.fillText(`P${i + 1}`, 80, 50 + i * 45);
			}
			for (let i = 0; i < 4; i++) {
				ctx.beginPath();
				ctx.moveTo(130, 50 + i * 90);
				ctx.lineTo(180, 70 + i * 90);
				ctx.stroke();
				ctx.moveTo(130, 95 + i * 90);
				ctx.lineTo(180, 70 + i * 90);
				ctx.stroke();
			}
			for (let i = 0; i < 4; i++) {
				ctx.strokeRect(180, 70 + i * 90, 100, 40);
				ctx.fillText(`QF${i + 1} Winner`, 230, 90 + i * 90);
			}
			for (let i = 0; i < 2; i++) {
				ctx.beginPath();
				ctx.moveTo(280, 90 + i * 180);
				ctx.lineTo(350, 130 + i * 180);
				ctx.stroke();
				ctx.moveTo(280, 180 + i * 180);
				ctx.lineTo(350, 130 + i * 180);
				ctx.stroke();
			}
			for (let i = 0; i < 2; i++) {
				ctx.strokeRect(350, 130 + i * 180, 100, 40);
				ctx.fillText(`SF${i + 1} Winner`, 400, 150 + i * 180);
			}
			ctx.beginPath();
			ctx.moveTo(450, 150);
			ctx.lineTo(520, 210);
			ctx.stroke();
			ctx.moveTo(450, 330);
			ctx.lineTo(520, 210);
			ctx.stroke();

			ctx.strokeRect(520, 210, 100, 40);
			ctx.fillText('Winner', 570, 230);
		} else {
			ctx.fillText(
				'Bracket for this number of players is not supported.',
				canvas.width / 2,
				canvas.height / 2
			);
		}

		wrapper.appendChild(canvas);

		const backBtn = document.createElement('button');
		backBtn.textContent = 'Leave tournament';
		backBtn.classList.add('btn', 'btn-secondary', 'mt-8', 'px-4', 'py-2');
		backBtn.onclick = async () => {
			const token = getCookie('access_token') ?? null;
			const sessionId = getCookie('sessionId') ?? null;
			if (await leaveRoom(currentRoomId, token, sessionId))
				await renderTournamentList();
		};
		wrapper.appendChild(backBtn);
		card.appendChild(wrapper);
		const playBtn = document.createElement('button');
		playBtn.textContent = 'Play Match';
		playBtn.classList.add('btn', 'btn-primary', 'mt-4', 'px-4', 'py-2');
		playBtn.onclick = async () => {
			const token = getCookie('access_token') ?? null;
			const sessionId = getCookie('sessionId') ?? null;
			// console.log(sessionId)
			// console.log(token)
			const response = await fetch('http://localhost:3000/tournament/play', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					roomId: currentRoomId,
					token,
					sessionId,
				}),
			});
			const data = await response.json();
			if (response.ok && data.gameId) {
				Toaster('Match found! Game ID: ' + data.gameId);
				showGameOverlay(data.gameId, 'tournament', currentRoomId);
			} else {
				Toaster(data.error || 'No match available yet.');
			}
		};
		wrapper.appendChild(playBtn);
	}

	renderTournamentList();
	tab.appendChild(card);
	return tab;
}

async function fetchTournamentRooms(
	token: string | null,
	sessionId: string | null
) {
	const response = await fetch('http://localhost:3000/tournament/rooms', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token, sessionId }),
	});
	return await response.json();
}

async function leaveRoom(
	roomId: string | null,
	token: string | null,
	sessionId: string | null
) {
	const response = await fetch('http://localhost:3000/tournament/leave', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ roomId, token, sessionId }),
	});
	return response.ok;
}
