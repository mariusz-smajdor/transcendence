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
import { TournamentBracket } from '../../../components/tournament-bracket';
import { getCookie } from '../../game/game-cookies.js';
import { showGameOverlay } from '../../game/game-overlay.js';
import { store } from '../../../store.js';
import { getAvatarUrl } from '../../../utils/avatarUtils.js';

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
				card.innerHTML = '';
				const players = rooms.positions ?? [];

				const bracketComponent = TournamentBracket({
					numberOfPlayers: rooms.playersExpected,
					playersIn: rooms.playersIn,
					players,
					onLeaveTournament: async () => {
						const token = getCookie('access_token') ?? null;
						const sessionId = getCookie('sessionId') ?? null;
						if (await leaveRoom(currentRoomId, token, sessionId))
							await renderTournamentList();
					},
					onPlayMatch: async () => {
						const token = getCookie('access_token') ?? null;
						const sessionId = getCookie('sessionId') ?? null;
						const response = await fetch(
							'http://localhost:3000/tournament/play',
							{
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									roomId: currentRoomId,
									token,
									sessionId,
								}),
							}
						);
						const data = await response.json();
						if (response.ok && data.gameId) {
							Toaster('Match found! Game ID: ' + data.gameId);
							showGameOverlay(data.gameId, 'tournament', currentRoomId);
						} else {
							Toaster(data.error || 'No match available yet.');
						}
					},
				});

				card.appendChild(bracketComponent);
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
						src: getAvatarUrl(room.avatar, room.creator),
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
								name: store.getState().user?.username ?? 'Guest',
								token,
								sessionId,
								roomId: room.id,
							}),
						}
					);
					const data = await response.json();
					console.log(data);
					if (response.ok) {
						card.innerHTML = '';
						const players = data.positions ?? [];

						const bracketComponent = TournamentBracket({
							numberOfPlayers: data.playersExpected,
							playersIn: data.playersIn,
							players,
							onLeaveTournament: async () => {
								const token = getCookie('access_token') ?? null;
								const sessionId = getCookie('sessionId') ?? null;
								if (await leaveRoom(currentRoomId, token, sessionId))
									await renderTournamentList();
							},
							onPlayMatch: async () => {
								const token = getCookie('access_token') ?? null;
								const sessionId = getCookie('sessionId') ?? null;
								const response = await fetch(
									'http://localhost:3000/tournament/play',
									{
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											roomId: currentRoomId,
											token,
											sessionId,
										}),
									}
								);
								const data = await response.json();
								if (response.ok && data.gameId) {
									Toaster('Match found! Game ID: ' + data.gameId);
									showGameOverlay(data.gameId, 'tournament', currentRoomId);
								} else {
									Toaster(data.error || 'No match available yet.');
								}
							},
						});

						card.appendChild(bracketComponent);
					}
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
		const isLoggedIn = !!token;

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
			let creator = store.getState().user?.username ?? 'Guest';
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
			const responseData = await response.json();
			card.innerHTML = '';
			const players = responseData.positions ?? [];

			const bracketComponent = TournamentBracket({
				numberOfPlayers,
				playersIn: 1, // This should be passed from the response data
				players,
				onLeaveTournament: async () => {
					const token = getCookie('access_token') ?? null;
					const sessionId = getCookie('sessionId') ?? null;
					if (await leaveRoom(currentRoomId, token, sessionId))
						await renderTournamentList();
				},
				onPlayMatch: async () => {
					const token = getCookie('access_token') ?? null;
					const sessionId = getCookie('sessionId') ?? null;
					const response = await fetch(
						'http://localhost:3000/tournament/play',
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								roomId: currentRoomId,
								token,
								sessionId,
							}),
						}
					);
					const data = await response.json();
					if (response.ok && data.gameId) {
						Toaster('Match found! Game ID: ' + data.gameId);
						showGameOverlay(data.gameId, 'tournament', currentRoomId);
					} else {
						Toaster(data.error || 'No match available yet.');
					}
				},
			});

			card.appendChild(bracketComponent);
		};
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
