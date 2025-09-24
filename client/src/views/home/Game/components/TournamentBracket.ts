import { Card } from '../../../../components/card';
import { getCookie } from '../../../game/game-cookies.js';
import { showGameOverlay } from '../../../game/game-overlay.js';
import { showPopupMessage } from '../../../../utils/tournamentUtils.js';

interface Match {
	gameId: string;
	leftPlayer?: string;
	rightPlayer?: string;
	leftScore?: number;
	rightScore?: number;
	winner?: boolean;
	currentRound: number;
}

interface TournamentBracketProps {
	numberOfPlayers: number;
	playersIn: number;
	players: string[];
	matches: Match[];
	roomId: string | null;
	onLeave: () => void;
}

export function TournamentBracket({
	numberOfPlayers,
	playersIn,
	players,
	matches,
	roomId,
	onLeave,
}: TournamentBracketProps) {
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

	titleContainer.appendChild(title);
	titleContainer.appendChild(refreshBtn);
	wrapper.appendChild(titleContainer);

	// Create bracket visualization using Tailwind classes
	const bracketContainer = document.createElement('div');
	bracketContainer.classList.add('w-full', 'max-w-4xl', 'mx-auto', 'font-sans');

	// Helper function to create a match element
	function createMatchElement(
		leftPlayer: string,
		rightPlayer: string,
		leftScore?: number,
		rightScore?: number,
		winner?: boolean
	) {
		const matchDiv = document.createElement('div');
		matchDiv.classList.add(
			'bg-zinc-900',
			'border-2',
			'border-zinc-700',
			'rounded-lg',
			'p-3',
			'min-h-[60px]',
			'relative'
		);

		if (winner) {
			matchDiv.classList.remove('border-zinc-700');
			matchDiv.classList.add('border-green-500', 'bg-green-900/20');
		}

		const leftPlayerDiv = document.createElement('div');
		leftPlayerDiv.classList.add(
			'flex',
			'justify-between',
			'items-center',
			'py-1',
			'text-sm'
		);

		if (
			winner &&
			leftScore !== undefined &&
			rightScore !== undefined &&
			leftScore > rightScore
		) {
			leftPlayerDiv.classList.add('text-green-400', 'font-bold');
		}

		leftPlayerDiv.innerHTML = `
			<span class="flex-1">${leftPlayer || 'TBD'}</span>
			<span class="font-bold ml-2">${leftScore !== undefined ? leftScore : ''}</span>
		`;

		const rightPlayerDiv = document.createElement('div');
		rightPlayerDiv.classList.add(
			'flex',
			'justify-between',
			'items-center',
			'py-1',
			'text-sm'
		);

		if (
			winner &&
			leftScore !== undefined &&
			rightScore !== undefined &&
			rightScore > leftScore
		) {
			rightPlayerDiv.classList.add('text-green-400', 'font-bold');
		}

		rightPlayerDiv.innerHTML = `
			<span class="flex-1">${rightPlayer || 'TBD'}</span>
			<span class="font-bold ml-2">${
				rightScore !== undefined ? rightScore : ''
			}</span>
		`;

		matchDiv.appendChild(leftPlayerDiv);
		matchDiv.appendChild(rightPlayerDiv);
		return matchDiv;
	}

	// Helper function to update bracket matches
	function updateBracketMatches(newMatches: Match[]) {
		const matchElements = bracketContainer.querySelectorAll('.bg-zinc-900');
		matchElements.forEach((matchEl, index) => {
			const match = newMatches[index];
			if (match) {
				const leftPlayer = matchEl.querySelector('div:first-child');
				const rightPlayer = matchEl.querySelector('div:last-child');

				if (leftPlayer && rightPlayer) {
					leftPlayer.innerHTML = `
						<span class="flex-1">${match.leftPlayer || 'TBD'}</span>
						<span class="font-bold ml-2">${
							match.leftScore !== undefined ? match.leftScore : ''
						}</span>
					`;
					rightPlayer.innerHTML = `
						<span class="flex-1">${match.rightPlayer || 'TBD'}</span>
						<span class="font-bold ml-2">${
							match.rightScore !== undefined ? match.rightScore : ''
						}</span>
					`;

					// Update winner styling
					if (match.winner) {
						matchEl.classList.remove('border-zinc-700');
						matchEl.classList.add('border-green-500', 'bg-green-900/20');

						if (
							match.leftScore &&
							match.rightScore &&
							match.leftScore > match.rightScore
						) {
							leftPlayer.classList.add('text-green-400', 'font-bold');
							rightPlayer.classList.remove('text-green-400', 'font-bold');
						} else {
							rightPlayer.classList.add('text-green-400', 'font-bold');
							leftPlayer.classList.remove('text-green-400', 'font-bold');
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
		firstRound.classList.add('flex', 'flex-col', 'gap-5', 'min-w-[200px]');
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
		finalRound.classList.add('flex', 'flex-col', 'gap-5', 'min-w-[200px]');
		finalRound.innerHTML =
			'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Final</h3>';

		const finalMatch = matches.find((m) => m.currentRound === 1);
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
		firstRound.classList.add('flex', 'flex-col', 'gap-5', 'min-w-[200px]');
		firstRound.innerHTML =
			'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">First Round</h3>';

		for (let i = 0; i < 8; i++) {
			firstRound.appendChild(
				createMatchElement(players[i] ?? `Player ${i + 1}`, 'TBD')
			);
		}

		// Quarter-finals
		const quarterRound = document.createElement('div');
		quarterRound.classList.add('flex', 'flex-col', 'gap-5', 'min-w-[200px]');
		quarterRound.innerHTML =
			'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Quarter-finals</h3>';

		const qfMatches = matches.filter((m) => m.currentRound === 1);
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
		semiRound.classList.add('flex', 'flex-col', 'gap-5', 'min-w-[200px]');
		semiRound.innerHTML =
			'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Semi-finals</h3>';

		const sfMatches = matches.filter((m) => m.currentRound === 2);
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
		finalRound.classList.add('flex', 'flex-col', 'gap-5', 'min-w-[200px]');
		finalRound.innerHTML =
			'<h3 class="text-center mb-4 font-bold text-sm text-gray-400">Final</h3>';

		const finalMatch = matches.find((m) => m.currentRound === 3);
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
	backBtn.onclick = onLeave;
	wrapper.appendChild(backBtn);

	// Check player status and conditionally show play button
	async function checkPlayerStatus() {
		const token = getCookie('access_token') ?? null;
		const sessionId = getCookie('sessionId') ?? null;

		if (!token && !sessionId) return;

		try {
			const response = await fetch('http://localhost:3000/tournament/status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					roomId,
					token,
					sessionId,
				}),
			});

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
										roomId,
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
								showGameOverlay(playData.gameId, 'tournament', roomId);
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

	card.appendChild(wrapper);
	return card;
}
