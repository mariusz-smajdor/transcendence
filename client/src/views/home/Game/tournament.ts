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

		newTournamentButton.addEventListener('click', () => {
			renderCreateForm();
		});

		refreshButton.addEventListener('click', () => {
			renderRooms();
		});

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
					try {
						const response = await fetch(
							'http://localhost:3000/tournament/join',
							{
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									name: 'Player', // Server will fetch actual username
									token,
									sessionId,
									roomId: room.id,
								}),
							}
						);
						const data = await response.json();
						console.log(data);
						if (response.ok) {
							showPopupMessage('Successfully joined tournament!');
							renderBracketCanvas(data.playersExpected, data.playersIn, data);
						} else {
							showPopupMessage(data.error || 'Failed to join tournament');
						}
					} catch (error) {
						console.error('Error joining tournament:', error);
						showPopupMessage('Network error. Please try again.');
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
			try {
				let creator = 'Player';
				if (!isLoggedIn) {
					const nickname = nicknameInput?.value.trim();
					if (!nickname) {
						nicknameInput?.classList.add('border-red-500');
						nicknameInput?.focus();
						return;
					}
					creator = nickname;
				}
				// Server will handle username fetching for authenticated users

				const numberOfPlayers = parseInt(select.value, 10);
				const response = await fetch(
					'http://localhost:3000/tournament/create',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							creator,
							token,
							sessionId,
							numberOfPlayers,
						}),
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					showPopupMessage(errorData.error || 'Failed to create tournament');
					return;
				}

				const data = await response.json();
				showPopupMessage('Tournament created successfully!');
				renderBracketCanvas(numberOfPlayers, 1, data);
			} catch (error) {
				console.error('Error creating tournament:', error);
				showPopupMessage('Network error. Please try again.');
			}
		};
	}

	function renderBracketCanvas(
		numberOfPlayers: number,
		playersIn: number,
		response: any
	) {
		//console.log(response)
		const players = response.positions ?? null;
		const matches = response.matches ?? [];
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

		const titleContainer = document.createElement('div');
		titleContainer.classList.add(
			'flex',
			'justify-between',
			'items-center',
			'mb-4'
		);

		const title = document.createElement('div');
		title.textContent = `Tournament bracket (${playersIn}/${numberOfPlayers} players)`;
		title.classList.add('font-bold', 'text-lg');

		const refreshBtn = document.createElement('button');
		refreshBtn.textContent = '🔄 Refresh';
		refreshBtn.classList.add('btn', 'btn-outline', 'px-3', 'py-1', 'text-sm');
		refreshBtn.onclick = async () => {
			try {
				const token = getCookie('access_token') ?? null;
				const sessionId = getCookie('sessionId') ?? null;

				const response = await fetch(
					'http://localhost:3000/tournament/status',
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

				if (response.ok) {
					const data = await response.json();
					// Update bracket with latest match data
					if (data.matches) {
						updateBracketMatches(data.matches);
					}
				}
			} catch (error) {
				console.error('Error refreshing bracket:', error);
			}
		};

		titleContainer.appendChild(title);
		titleContainer.appendChild(refreshBtn);
		wrapper.appendChild(titleContainer);

		// Create a better bracket visualization using HTML/CSS instead of canvas
		const bracketContainer = document.createElement('div');
		bracketContainer.classList.add(
			'tournament-bracket',
			'w-full',
			'max-w-4xl',
			'mx-auto'
		);

		// Add CSS styles for the bracket (only once)
		if (!document.getElementById('tournament-bracket-styles')) {
			const style = document.createElement('style');
			style.id = 'tournament-bracket-styles';
			style.textContent = `
				.tournament-bracket {
					font-family: 'Inter', sans-serif;
				}
				.bracket-round {
					display: flex;
					flex-direction: column;
					gap: 20px;
					min-width: 200px;
				}
				.bracket-match {
					background: #1a1a1a;
					border: 2px solid #333;
					border-radius: 8px;
					padding: 12px;
					min-height: 60px;
					position: relative;
				}
				.bracket-match.winner {
					border-color: #4ade80;
					background: #0f1f0f;
				}
				.match-player {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 4px 0;
					font-size: 14px;
				}
				.match-player.winner {
					color: #4ade80;
					font-weight: bold;
				}
				.player-name {
					flex: 1;
				}
				.player-score {
					font-weight: bold;
					margin-left: 10px;
				}
			`;
			document.head.appendChild(style);
		}

		// Helper function to create a match element
		function createMatchElement(
			leftPlayer: string,
			rightPlayer: string,
			leftScore?: number,
			rightScore?: number,
			winner?: boolean
		) {
			const matchDiv = document.createElement('div');
			matchDiv.classList.add('bracket-match');
			if (winner) matchDiv.classList.add('winner');

			const leftPlayerDiv = document.createElement('div');
			leftPlayerDiv.classList.add('match-player');
			if (
				winner &&
				leftScore !== undefined &&
				rightScore !== undefined &&
				leftScore > rightScore
			) {
				leftPlayerDiv.classList.add('winner');
			}
			leftPlayerDiv.innerHTML = `
				<span class="player-name">${leftPlayer || 'TBD'}</span>
				<span class="player-score">${leftScore !== undefined ? leftScore : ''}</span>
			`;

			const rightPlayerDiv = document.createElement('div');
			rightPlayerDiv.classList.add('match-player');
			if (
				winner &&
				leftScore !== undefined &&
				rightScore !== undefined &&
				rightScore > leftScore
			) {
				rightPlayerDiv.classList.add('winner');
			}
			rightPlayerDiv.innerHTML = `
				<span class="player-name">${rightPlayer || 'TBD'}</span>
				<span class="player-score">${rightScore !== undefined ? rightScore : ''}</span>
			`;

			matchDiv.appendChild(leftPlayerDiv);
			matchDiv.appendChild(rightPlayerDiv);
			return matchDiv;
		}

		// Helper function to update bracket matches
		function updateBracketMatches(newMatches: any[]) {
			const matchElements = bracketContainer.querySelectorAll('.bracket-match');
			matchElements.forEach((matchEl, index) => {
				const match = newMatches[index];
				if (match) {
					const leftPlayer = matchEl.querySelector('.match-player:first-child');
					const rightPlayer = matchEl.querySelector('.match-player:last-child');

					if (leftPlayer && rightPlayer) {
						leftPlayer.innerHTML = `
							<span class="player-name">${match.leftPlayer || 'TBD'}</span>
							<span class="player-score">${
								match.leftScore !== undefined ? match.leftScore : ''
							}</span>
						`;
						rightPlayer.innerHTML = `
							<span class="player-name">${match.rightPlayer || 'TBD'}</span>
							<span class="player-score">${
								match.rightScore !== undefined ? match.rightScore : ''
							}</span>
						`;

						// Update winner styling
						if (match.winner) {
							matchEl.classList.add('winner');
							if (match.leftScore > match.rightScore) {
								leftPlayer.classList.add('winner');
								rightPlayer.classList.remove('winner');
							} else {
								rightPlayer.classList.add('winner');
								leftPlayer.classList.remove('winner');
							}
						}
					}
				}
			});
		}

		// Create bracket rounds
		const roundsContainer = document.createElement('div');
		roundsContainer.classList.add(
			'flex',
			'gap-8',
			'justify-center',
			'items-start'
		);

		if (numberOfPlayers === 4) {
			// Quarter-finals (First Round for 4 players)
			const firstRound = document.createElement('div');
			firstRound.classList.add('bracket-round');
			firstRound.innerHTML =
				'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Quarter-finals</h3>';

			firstRound.appendChild(
				createMatchElement(players[0] ?? 'Player 1', players[1] ?? 'Player 2')
			);
			firstRound.appendChild(
				createMatchElement(players[2] ?? 'Player 3', players[3] ?? 'Player 4')
			);

			// Final (no semi-finals for 4 players)
			const finalRound = document.createElement('div');
			finalRound.classList.add('bracket-round');
			finalRound.innerHTML =
				'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Final</h3>';

			const finalMatch = matches.find((m: any) => m.currentRound === 1);
			finalRound.appendChild(
				createMatchElement(
					finalMatch?.leftPlayer ?? 'TBD',
					finalMatch?.rightPlayer ?? 'TBD',
					finalMatch?.leftScore,
					finalMatch?.rightScore,
					finalMatch?.winner
				)
			);

			roundsContainer.appendChild(firstRound);
			roundsContainer.appendChild(finalRound);
		} else if (numberOfPlayers === 8) {
			// First Round
			const firstRound = document.createElement('div');
			firstRound.classList.add('bracket-round');
			firstRound.innerHTML =
				'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">First Round</h3>';

			for (let i = 0; i < 8; i++) {
				firstRound.appendChild(
					createMatchElement(players[i] ?? `Player ${i + 1}`, 'TBD')
				);
			}

			// Quarter-finals
			const quarterRound = document.createElement('div');
			quarterRound.classList.add('bracket-round');
			quarterRound.innerHTML =
				'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Quarter-finals</h3>';

			const qfMatches = matches.filter((m: any) => m.currentRound === 1);
			for (let i = 0; i < 4; i++) {
				const qfMatch = qfMatches[i];
				quarterRound.appendChild(
					createMatchElement(
						qfMatch?.leftPlayer ?? 'TBD',
						qfMatch?.rightPlayer ?? 'TBD',
						qfMatch?.leftScore,
						qfMatch?.rightScore,
						qfMatch?.winner
					)
				);
			}

			// Semi-finals
			const semiRound = document.createElement('div');
			semiRound.classList.add('bracket-round');
			semiRound.innerHTML =
				'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Semi-finals</h3>';

			const sfMatches = matches.filter((m: any) => m.currentRound === 2);
			for (let i = 0; i < 2; i++) {
				const sfMatch = sfMatches[i];
				semiRound.appendChild(
					createMatchElement(
						sfMatch?.leftPlayer ?? 'TBD',
						sfMatch?.rightPlayer ?? 'TBD',
						sfMatch?.leftScore,
						sfMatch?.rightScore,
						sfMatch?.winner
					)
				);
			}

			// Final
			const finalRound = document.createElement('div');
			finalRound.classList.add('bracket-round');
			finalRound.innerHTML =
				'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Final</h3>';

			const finalMatch = matches.find((m: any) => m.currentRound === 3);
			finalRound.appendChild(
				createMatchElement(
					finalMatch?.leftPlayer ?? 'TBD',
					finalMatch?.rightPlayer ?? 'TBD',
					finalMatch?.leftScore,
					finalMatch?.rightScore,
					finalMatch?.winner
				)
			);

			roundsContainer.appendChild(firstRound);
			roundsContainer.appendChild(quarterRound);
			roundsContainer.appendChild(semiRound);
			roundsContainer.appendChild(finalRound);
		} else {
			const unsupportedDiv = document.createElement('div');
			unsupportedDiv.classList.add('text-center', 'text-gray-400', 'py-8');
			unsupportedDiv.textContent =
				'Bracket for this number of players is not supported.';
			roundsContainer.appendChild(unsupportedDiv);
		}

		bracketContainer.appendChild(roundsContainer);
		wrapper.appendChild(bracketContainer);

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
		// Check player status and conditionally show play button
		async function checkPlayerStatus() {
			const token = getCookie('access_token') ?? null;
			const sessionId = getCookie('sessionId') ?? null;

			if (!token && !sessionId) return;

			try {
				const response = await fetch(
					'http://localhost:3000/tournament/status',
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

				if (response.ok) {
					const data = await response.json();

					// Update bracket with latest match data
					if (data.matches) {
						updateBracketMatches(data.matches);
					}

					if (data.canPlay) {
						const playBtn = document.createElement('button');
						playBtn.textContent = 'Play Match';
						playBtn.classList.add('btn', 'btn-primary', 'mt-4', 'px-4', 'py-2');
						playBtn.onclick = async () => {
							try {
								// Show loading state
								playBtn.textContent = 'Finding Match...';
								playBtn.disabled = true;

								const playResponse = await fetch(
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
								const playData = await playResponse.json();

								// Reset button state
								playBtn.textContent = 'Play Match';
								playBtn.disabled = false;

								if (playResponse.ok && playData.gameId) {
									showPopupMessage('Match found! Starting game...');
									showGameOverlay(playData.gameId, 'tournament', currentRoomId);
								} else {
									showPopupMessage(playData.error || 'No match available yet.');
								}
							} catch (error) {
								console.error('Error finding match:', error);
								showPopupMessage('Network error. Please try again.');

								// Reset button state
								playBtn.textContent = 'Play Match';
								playBtn.disabled = false;
							}
						};
						wrapper.appendChild(playBtn);
					} else {
						// Player has been eliminated
						const statusDiv = document.createElement('div');
						statusDiv.classList.add(
							'mt-4',
							'p-4',
							'bg-red-500/20',
							'border',
							'border-red-500',
							'rounded',
							'text-center'
						);
						statusDiv.innerHTML = `
							<p class="text-red-400 font-bold">You have been eliminated from this tournament</p>
							<p class="text-sm text-red-300 mt-2">Round ${
								data.tournamentStatus?.currentRound || 1
							} of ${data.tournamentStatus?.totalRounds || 1}</p>
						`;
						wrapper.appendChild(statusDiv);
					}
				}
			} catch (error) {
				console.error('Error checking player status:', error);
			}
		}

		checkPlayerStatus();
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

export function showPopupMessage(message: string, duration: number = 3000) {
	const oldPopup = document.getElementById('popup-message');
	if (oldPopup) oldPopup.remove();

	const popup = document.createElement('div');
	popup.id = 'popup-message';
	popup.textContent = message;

	popup.className = `
        fixed top-8 left-1/2 transform -translate-x-1/2 z-[9999]
        px-6 py-3 rounded-lg font-bold shadow-2xl
        bg-primary text-white border-2 border-primary
        transition-opacity duration-500
    `;

	document.body.appendChild(popup);

	setTimeout(() => {
		popup.style.opacity = '0';
		setTimeout(() => popup.remove(), 500);
	}, duration);
}
