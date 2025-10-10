import { type ComponentProps } from '../types/component';
import { Card } from './card';
import { Text } from './text';
import { Button } from './button';
import { Icon } from './icon';
import { Cross, Trophy } from 'lucide';
import { store } from '../store';

type MatchResult = {
	matchId: string;
	winner: string;
	loser: string;
};

type TournamentBracketProps = ComponentProps & {
	numberOfPlayers: number;
	playersIn: number;
	players: string[];
	matchResults?: MatchResult[];
	playerStatus?: Array<{
		nickname: string;
		canPlay: boolean;
		token: string;
		sessionId: string;
	}>;
	onLeaveTournament: () => void;
	onPlayMatch: () => void;
};

// Function removed as per requirements

type BracketMatch = {
	id: string;
	player1?: string;
	player2?: string;
	winner?: string;
	isCompleted?: boolean;
	round: 'quarter' | 'semi' | 'final';
	position: { x: number; y: number };
};

function getMatchWinner(
	matchId: string,
	matchResults: MatchResult[]
): string | null {
	const result = matchResults.find((r) => r.matchId === matchId);

	return result ? result.winner : null;
}

function createBracketMatches(
	numberOfPlayers: number,
	players: string[],
	matchResults: MatchResult[] = []
): BracketMatch[] {
	const matches: BracketMatch[] = [];

	if (numberOfPlayers === 4) {
		// Semi finals (first stage for 4 players)
		const sf1Winner = getMatchWinner('sf1', matchResults);
		const sf2Winner = getMatchWinner('sf2', matchResults);

		matches.push(
			{
				id: 'sf1',
				player1: players[0] || 'Waiting for player...',
				player2: players[1] || 'Waiting for player...',
				winner: sf1Winner || undefined,
				isCompleted: !!sf1Winner,
				round: 'semi',
				position: { x: 0, y: 0 },
			},
			{
				id: 'sf2',
				player1: players[2] || 'Waiting for player...',
				player2: players[3] || 'Waiting for player...',
				winner: sf2Winner || undefined,
				isCompleted: !!sf2Winner,
				round: 'semi',
				position: { x: 0, y: 1 },
			}
		);

		// Final - show winners immediately when available
		const finalWinner = getMatchWinner('final', matchResults);
		if (sf1Winner || sf2Winner || finalWinner) {
			matches.push({
				id: 'final',
				player1: sf1Winner || 'TBD',
				player2: sf2Winner || 'TBD',
				winner: finalWinner || undefined,
				isCompleted: !!finalWinner,
				round: 'final',
				position: { x: 1, y: 0.5 },
			});
		} else {
			// No semifinals completed yet, show placeholder
			matches.push({
				id: 'final',
				player1: 'TBD',
				player2: 'TBD',
				round: 'final',
				position: { x: 1, y: 0.5 },
			});
		}
	} else if (numberOfPlayers === 8) {
		// Quarter finals
		const quarterWinners: (string | null)[] = [];
		for (let i = 0; i < 4; i++) {
			const qfWinner = getMatchWinner(`qf${i + 1}`, matchResults);
			quarterWinners.push(qfWinner);

			matches.push({
				id: `qf${i + 1}`,
				player1: players[i * 2] || 'Waiting for player...',
				player2: players[i * 2 + 1] || 'Waiting for player...',
				winner: qfWinner || undefined,
				isCompleted: !!qfWinner,
				round: 'quarter',
				position: { x: 0, y: i },
			});
		}

		// Semi finals - show winners immediately when available
		const sf1Winner = getMatchWinner('sf1', matchResults);
		const sf2Winner = getMatchWinner('sf2', matchResults);

		if (quarterWinners[0] || quarterWinners[1] || sf1Winner) {
			matches.push({
				id: 'sf1',
				player1: quarterWinners[0] || 'TBD',
				player2: quarterWinners[1] || 'TBD',
				winner: sf1Winner || undefined,
				isCompleted: !!sf1Winner,
				round: 'semi',
				position: { x: 1, y: 0.5 },
			});
		} else {
			matches.push({
				id: 'sf1',
				player1: 'TBD',
				player2: 'TBD',
				round: 'semi',
				position: { x: 1, y: 0.5 },
			});
		}

		if (quarterWinners[2] || quarterWinners[3] || sf2Winner) {
			matches.push({
				id: 'sf2',
				player1: quarterWinners[2] || 'TBD',
				player2: quarterWinners[3] || 'TBD',
				winner: sf2Winner || undefined,
				isCompleted: !!sf2Winner,
				round: 'semi',
				position: { x: 1, y: 1.5 },
			});
		} else {
			matches.push({
				id: 'sf2',
				player1: 'TBD',
				player2: 'TBD',
				round: 'semi',
				position: { x: 1, y: 1.5 },
			});
		}

		// Final - show winners immediately when available
		const finalWinner = getMatchWinner('final', matchResults);
		if (sf1Winner || sf2Winner || finalWinner) {
			matches.push({
				id: 'final',
				player1: sf1Winner || 'TBD',
				player2: sf2Winner || 'TBD',
				winner: finalWinner || undefined,
				isCompleted: !!finalWinner,
				round: 'final',
				position: { x: 2, y: 1 },
			});
		} else {
			matches.push({
				id: 'final',
				player1: 'TBD',
				player2: 'TBD',
				round: 'final',
				position: { x: 2, y: 1 },
			});
		}
	}

	return matches;
}

function MatchCard({
	match,
	classes = [],
}: {
	match: BracketMatch;
	classes?: string[];
}) {
	// Determine card styling based on match completion status
	const cardClasses = [
		'min-w-[120px]',
		'min-h-[40px]',
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'text-center',
		'border-2',
		'text-sm',
		'font-medium',
		...classes,
	];

	// Add completion-based styling
	if (match.isCompleted) {
		cardClasses.push('border-green-500', 'bg-green-900', 'text-green-100');
	} else {
		cardClasses.push('border-gray-600', 'bg-gray-800', 'text-white');
	}

	const card = Card({ classes: cardClasses });

	if (match.player1 && match.player2) {
		// Show both players with winner highlighting
		const player1Classes = ['text-xs', 'mb-1'];
		const player2Classes = ['text-xs'];

		// Highlight the winner
		if (match.winner) {
			if (match.winner === match.player1) {
				player1Classes.push('font-bold', 'text-green-300');
				player2Classes.push('text-gray-400', 'line-through');
			} else if (match.winner === match.player2) {
				player2Classes.push('font-bold', 'text-green-300');
				player1Classes.push('text-gray-400', 'line-through');
			}
		}

		const player1Text = Text({
			content: match.player1,
			classes: player1Classes,
		});
		const vsText = Text({
			content: 'vs',
			classes: ['text-xs', 'text-gray-400', 'mb-1'],
		});
		const player2Text = Text({
			content: match.player2,
			classes: player2Classes,
		});

		card.appendChild(player1Text);
		card.appendChild(vsText);
		card.appendChild(player2Text);

		// Add winner indicator if match is completed
		if (match.winner && match.isCompleted) {
			const winnerIndicator = Text({
				content: `🏆 ${match.winner}`,
				classes: ['text-xs', 'mt-1', 'text-yellow-400', 'font-bold'],
			});
			card.appendChild(winnerIndicator);
		}
	} else if (match.player1 === 'TBD' && match.player2 === 'TBD') {
		// Show TBD for both players
		const tbdText = Text({
			content: 'TBD vs TBD',
			classes: ['text-xs', 'text-gray-500'],
		});
		card.appendChild(tbdText);
	} else if (match.player1 && match.player1 !== 'TBD') {
		// Show advancing player waiting for opponent
		const advancingText = Text({
			content: match.player1,
			classes: ['text-xs', 'font-bold', 'text-green-300', 'mb-1'],
		});
		const waitingText = Text({
			content: 'vs TBD',
			classes: ['text-xs', 'text-gray-500'],
		});
		card.appendChild(advancingText);
		card.appendChild(waitingText);
	} else if (match.player2 && match.player2 !== 'TBD') {
		// Show advancing player waiting for opponent
		const waitingText = Text({
			content: 'TBD vs',
			classes: ['text-xs', 'text-gray-500', 'mb-1'],
		});
		const advancingText = Text({
			content: match.player2,
			classes: ['text-xs', 'font-bold', 'text-green-300'],
		});
		card.appendChild(waitingText);
		card.appendChild(advancingText);
	}

	return card;
}

export function TournamentBracket({
	numberOfPlayers,
	playersIn,
	players,
	matchResults = [],
	playerStatus: _playerStatus = [],
	onLeaveTournament,
	onPlayMatch,
	classes = [],
}: TournamentBracketProps) {
	const container = Card({
		classes: [
			'flex',
			'flex-col',
			'items-center',
			'justify-center',
			'gap-6',
			'py-8',
			'bg-gray-900',
			...classes,
		],
	});

	// Title
	const title = document.createElement('div');
	title.textContent = `Tournament bracket (${playersIn}/${numberOfPlayers} players)`;
	title.classList.add('font-bold', 'mb-4', 'text-lg', 'text-white');
	container.appendChild(title);

	// Bracket container
	const bracketContainer = document.createElement('div');
	bracketContainer.classList.add(
		'relative',
		'flex',
		'flex-row',
		'items-center',
		'justify-center',
		'gap-8',
		'p-6',
		'bg-gray-800',
		'rounded-lg',
		'border',
		'border-gray-600'
	);

	// Create matches
	const matches = createBracketMatches(numberOfPlayers, players, matchResults);

	// Group matches by round
	const rounds = matches.reduce((acc, match) => {
		if (!acc[match.round]) {
			acc[match.round] = [];
		}
		acc[match.round].push(match);
		return acc;
	}, {} as Record<string, BracketMatch[]>);

	// Render each round
	Object.entries(rounds).forEach(([, roundMatches]) => {
		const roundContainer = document.createElement('div');
		roundContainer.classList.add('flex', 'flex-col', 'gap-4', 'items-center');

		roundMatches.forEach((match) => {
			const matchCard = MatchCard({ match });
			roundContainer.appendChild(matchCard);
		});

		bracketContainer.appendChild(roundContainer);
	});

	container.appendChild(bracketContainer);

	// Action buttons
	const buttonContainer = document.createElement('div');
	buttonContainer.classList.add('flex', 'flex-col', 'gap-4', 'mt-6');

	const leaveBtn = Button({
		content: 'Leave tournament',
		variant: 'outline',
		classes: ['px-4', 'py-2'],
	});
	leaveBtn.onclick = onLeaveTournament;

	const playBtn = Button({
		content: 'Play Match',
		variant: 'primary',
		classes: ['px-4', 'py-2'],
	});
	playBtn.onclick = onPlayMatch;

	buttonContainer.appendChild(leaveBtn);
	buttonContainer.appendChild(playBtn);
	container.appendChild(buttonContainer);

	const finalWinner = getMatchWinner('final', matchResults);
	if (finalWinner) {
		const currentUser = store.getState().user;
		const isCurrentUserWinner =
			currentUser && currentUser.username === finalWinner;

		// Remove play button since tournament is finished
		if (buttonContainer.contains(playBtn)) {
			buttonContainer.removeChild(playBtn);
		}

		if (isCurrentUserWinner) {
			// Show winner card for the winner
			const winnerCard = Card({
				element: 'div',
				classes: [
					'absolute',
					'top-0',
					'left-0',
					'right-0',
					'bottom-0',
					'z-50',
					'flex',
					'items-center',
					'justify-center',
					'flex-col',
					'gap-8',
					'bg-amber-900',
					'border-amber-500',
					'text-amber-400',
				],
			});
			const winnerIcon = Icon({ icon: Trophy, classes: ['text-2xl'] });
			winnerCard.appendChild(winnerIcon);
			const winnerContainer = document.createElement('div');
			winnerContainer.classList.add(
				'flex',
				'items-center',
				'justify-center',
				'flex-col',
				'gap-2'
			);
			const winnerHeading = Text({
				content: 'You are the winner!',
				classes: ['text-xs'],
			});
			winnerContainer.appendChild(winnerHeading);
			const winnerText = Text({
				content: 'Congratulations!',
				classes: ['text-lg', 'font-bold'],
			});
			winnerContainer.appendChild(winnerText);
			winnerCard.appendChild(winnerContainer);
			bracketContainer.appendChild(winnerCard);
		} else if (currentUser) {
			// Show loser card for non-winner participants
			const loserCard = Card({
				element: 'div',
				classes: [
					'absolute',
					'top-0',
					'left-0',
					'right-0',
					'bottom-0',
					'z-50',
					'flex',
					'items-center',
					'justify-center',
					'flex-col',
					'gap-8',
					'bg-red-900',
					'border-red-500',
					'text-red-400',
				],
			});
			const loserIcon = Icon({ icon: Cross, classes: ['text-2xl'] });
			loserCard.appendChild(loserIcon);
			const loserContainer = document.createElement('div');
			loserContainer.classList.add(
				'flex',
				'items-center',
				'justify-center',
				'flex-col',
				'gap-2'
			);
			const loserHeading = Text({
				content: 'Tournament finished!',
				classes: ['text-xs'],
			});
			loserContainer.appendChild(loserHeading);
			const loserText = Text({
				content: `Winner: ${finalWinner}`,
				classes: ['text-lg', 'font-bold'],
			});
			loserContainer.appendChild(loserText);
			loserCard.appendChild(loserContainer);
			bracketContainer.appendChild(loserCard);
		}
	}

	return container;
}
