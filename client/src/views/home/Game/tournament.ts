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
import { onInvitation } from '../../../api/invitationSocket.js';
import { showNicknameModal } from '../../../components/nickname-modal.js';

// Transform server match results to client format
function transformServerMatchResults(
	serverMatches: any[],
	numberOfPlayers: number
) {
	console.log('Transforming server matches:', {
		serverMatches,
		numberOfPlayers,
	});
	const matchResults: Array<{
		matchId: string;
		winner: string;
		loser: string;
	}> = [];

	// Server matches don't have explicit match IDs, so we need to map them based on tournament structure
	// For now, we'll create a simple mapping based on the order of matches
	serverMatches.forEach((match, index) => {
		if (match.winner) {
			// Determine match ID based on tournament structure and match index
			let matchId: string;
			if (numberOfPlayers === 4) {
				// For 4 players: sf1, sf2, final
				if (index === 0) matchId = 'sf1';
				else if (index === 1) matchId = 'sf2';
				else if (index === 2) matchId = 'final';
				else return; // Skip invalid matches
			} else if (numberOfPlayers === 8) {
				// For 8 players: qf1, qf2, qf3, qf4, sf1, sf2, final
				if (index < 4) matchId = `qf${index + 1}`;
				else if (index < 6) matchId = `sf${index - 3}`;
				else if (index === 6) matchId = 'final';
				else return; // Skip invalid matches
			} else {
				return; // Unsupported tournament size
			}

			// Now match.winner contains the actual player nickname
			// Determine the loser from the player information
			const loser =
				match.leftPlayer && match.rightPlayer
					? match.winner === match.leftPlayer
						? match.rightPlayer
						: match.leftPlayer
					: 'Unknown';

			matchResults.push({
				matchId,
				winner: match.winner,
				loser: loser,
			});
		}
	});

	console.log('Final transformed match results:', matchResults);
	return matchResults;
}

let currentRoomId: string | null = null;
let currentBracketComponent: HTMLElement | null = null;

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
		currentBracketComponent = null;

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

		const buttonsWrapper = Wrapper({
			classes: ['flex', 'gap-2'],
		});

		const newTournamentButton = Button({
			variant: 'primary',
			content: 'New Tournament',
		});

		newTournamentButton.addEventListener('click', () => {
			renderCreateForm();
		});

		const refreshButton = Button({
			variant: 'outline',
			content: 'Refresh',
		});

		refreshButton.addEventListener('click', async () => {
			await renderRooms();
		});

		const wrapper = Wrapper({
			element: 'div',
			classes: ['flex', 'justify-between'],
		});
		wrapper.appendChild(heading);
		buttonsWrapper.appendChild(newTournamentButton);
		buttonsWrapper.appendChild(refreshButton);
		wrapper.appendChild(buttonsWrapper);
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

				// Transform server match results to client format
				const matchResults = transformServerMatchResults(
					rooms.matches || [],
					rooms.playersExpected
				);

				const bracketComponent = TournamentBracket({
					numberOfPlayers: rooms.playersExpected,
					playersIn: rooms.playersIn,
					players,
					matchResults,
					playerStatus: rooms.playersStatus,
					onLeaveTournament: async () => {
						const token = getCookie('access_token') ?? null;
						const sessionId = getCookie('sessionId') ?? null;
						if (await leaveRoom(currentRoomId, token, sessionId))
							await renderTournamentList();
					},
					onPlayMatch: async () => {
						const token = getCookie('access_token') ?? null;
						const sessionId = getCookie('sessionId') ?? null;
						const response = await fetch('/api/tournament/play', {
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
					},
				});

				currentBracketComponent = bracketComponent;
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
					variant: 'primary',
					content: 'Join',
				});

				joinButton.addEventListener('click', async () => {
					const isLoggedIn = !!token;

					const performJoin = async (playerName: string) => {
						const response = await fetch('/api/tournament/join', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								name: playerName,
								token,
								sessionId,
								roomId: room.id,
							}),
						});
						const data = await response.json();
						console.log(data);
						if (response.ok) {
							currentRoomId = data.id;
							card.innerHTML = '';
							const players = data.positions ?? [];

							const bracketComponent = TournamentBracket({
								numberOfPlayers: data.playersExpected,
								playersIn: data.playersIn,
								players,
								playerStatus: data.playersStatus,
								onLeaveTournament: async () => {
									const token = getCookie('access_token') ?? null;
									const sessionId = getCookie('sessionId') ?? null;
									if (await leaveRoom(currentRoomId, token, sessionId))
										await renderTournamentList();
								},
								onPlayMatch: async () => {
									const token = getCookie('access_token') ?? null;
									const sessionId = getCookie('sessionId') ?? null;
									const response = await fetch('/api/tournament/play', {
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
								},
							});

							currentBracketComponent = bracketComponent;
							card.appendChild(bracketComponent);
						} else {
							Toaster(data.error || 'Failed to join tournament');
						}
					};

					if (!isLoggedIn) {
						// Show nickname modal for non-logged-in users
						showNicknameModal({
							title: 'Enter Nickname',
							description: 'Please enter your nickname to join the tournament',
							placeholder: 'Your nickname',
							onConfirm: (nickname) => {
								performJoin(nickname);
							},
						});
					} else {
						// Logged-in users can join immediately
						const playerName = store.getState().user?.username ?? 'Guest';
						await performJoin(playerName);
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
		title.textContent = 'Create Tournament';
		title.classList.add('font-bold', 'text-xl', 'mb-4');

		const token = getCookie('access_token') ?? null;
		const sessionId = getCookie('sessionId') ?? null;
		const isLoggedIn = !!token;

		let nicknameInput: HTMLInputElement | null = null;

		// Append title first
		formWrapper.appendChild(title);

		// Add nickname input for unauthorized users
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
			nicknameInput.placeholder = 'Your nickname';
			nicknameInput.classList.add('border', 'rounded', 'p-2', 'w-full');
			nicknameInput.maxLength = 20;
			nicknameInput.required = true;

			// Remove error styling when user starts typing
			nicknameInput.addEventListener('input', () => {
				nicknameInput?.classList.remove('border-red-500');
			});

			nicknameWrapper.appendChild(nicknameLabel);
			nicknameWrapper.appendChild(nicknameInput);
			formWrapper.appendChild(nicknameWrapper);
		}

		// Add number of players selection
		const selectWrapper = document.createElement('div');
		selectWrapper.classList.add(
			'flex',
			'flex-col',
			'gap-2',
			'w-full',
			'max-w-md'
		);

		const selectLabel = document.createElement('label');
		selectLabel.textContent = 'Number of players:';
		selectLabel.classList.add('text-sm', 'font-medium');

		const select = document.createElement('select');
		select.classList.add('border', 'rounded', 'p-2', 'w-full');
		[4, 8].forEach((num) => {
			const option = document.createElement('option');
			option.value = num.toString();
			option.textContent = num.toString();
			select.appendChild(option);
		});

		selectWrapper.appendChild(selectLabel);
		selectWrapper.appendChild(select);
		formWrapper.appendChild(selectWrapper);

		// Add buttons
		const buttons = document.createElement('div');
		buttons.classList.add(
			'flex',
			'gap-2',
			'justify-end',
			'w-full',
			'max-w-md',
			'mt-4'
		);

		const confirmBtn = document.createElement('button');
		confirmBtn.textContent = 'Create';
		confirmBtn.classList.add('btn', 'btn-primary', 'px-4', 'py-2');

		const cancelBtn = document.createElement('button');
		cancelBtn.textContent = 'Cancel';
		cancelBtn.classList.add('btn', 'btn-secondary', 'px-4', 'py-2');

		buttons.appendChild(cancelBtn);
		buttons.appendChild(confirmBtn);

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
					Toaster('Please enter your nickname');
					return;
				}
				if (nickname.length < 2) {
					nicknameInput?.classList.add('border-red-500');
					nicknameInput?.focus();
					Toaster('Nickname must be at least 2 characters');
					return;
				}
				// Remove error styling if validation passes
				nicknameInput?.classList.remove('border-red-500');
				creator = nickname;
			}

			const numberOfPlayers = parseInt(select.value, 10);
			let response = await fetch('/api/tournament/create', {
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
			currentRoomId = responseData.id;
			card.innerHTML = '';
			const players = responseData.positions ?? [];

			const bracketComponent = TournamentBracket({
				numberOfPlayers,
				playersIn: 1, // This should be passed from the response data
				players,
				matchResults: [], // No matches yet for newly created tournament
				playerStatus: responseData.playersStatus,
				onLeaveTournament: async () => {
					const token = getCookie('access_token') ?? null;
					const sessionId = getCookie('sessionId') ?? null;
					if (await leaveRoom(currentRoomId, token, sessionId))
						await renderTournamentList();
				},
				onPlayMatch: async () => {
					const token = getCookie('access_token') ?? null;
					const sessionId = getCookie('sessionId') ?? null;
					const response = await fetch('/api/tournament/play', {
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
				},
			});

			currentBracketComponent = bracketComponent;
			card.appendChild(bracketComponent);
		};
	}

	// Set up WebSocket listener for tournament updates
	const unsubscribe = onInvitation((data) => {
		if (data.type === 'tournament_update' && currentRoomId) {
			console.log('Received tournament update:', data);
			updateTournamentBracket(data, renderTournamentList);
		}
	});

	// Clean up listener when component is removed
	tab.addEventListener('remove', () => {
		unsubscribe();
	});

	renderTournamentList();
	tab.appendChild(card);
	return tab;
}

function updateTournamentBracket(
	data: any,
	renderTournamentList: () => Promise<void>
) {
	if (!currentBracketComponent || !currentRoomId) return;

	console.log('Updating tournament bracket with data:', data);
	console.log('Raw matches from server:', data.matches);

	// Update the tournament bracket with new player data
	const matchResults = transformServerMatchResults(
		data.matches || [],
		data.playersExpected
	);

	console.log('Transformed match results:', matchResults);
	const bracketComponent = TournamentBracket({
		numberOfPlayers: data.playersExpected,
		playersIn: data.playersIn,
		players: data.positions,
		matchResults,
		playerStatus: data.playersStatus,
		onLeaveTournament: async () => {
			const token = getCookie('access_token') ?? null;
			const sessionId = getCookie('sessionId') ?? null;
			if (await leaveRoom(currentRoomId, token, sessionId))
				await renderTournamentList();
		},
		onPlayMatch: async () => {
			const token = getCookie('access_token') ?? null;
			const sessionId = getCookie('sessionId') ?? null;
			const response = await fetch('/api/tournament/play', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					roomId: currentRoomId,
					token,
					sessionId,
				}),
			});
			const responseData = await response.json();
			if (response.ok && responseData.gameId) {
				Toaster('Match found! Game ID: ' + responseData.gameId);
				showGameOverlay(responseData.gameId, 'tournament', currentRoomId);
			} else {
				Toaster(responseData.error || 'No match available yet.');
			}
		},
	});

	// Replace the current bracket component
	currentBracketComponent.parentNode?.replaceChild(
		bracketComponent,
		currentBracketComponent
	);
	currentBracketComponent = bracketComponent;
}

async function fetchTournamentRooms(
	token: string | null,
	sessionId: string | null
) {
	const response = await fetch('/api/tournament/rooms', {
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
	const response = await fetch('/api/tournament/leave', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ roomId, token, sessionId }),
	});

	if (!response.ok) {
		const errorData = await response.json();
		console.error('Leave room error:', errorData);
	}

	return response.ok;
}
