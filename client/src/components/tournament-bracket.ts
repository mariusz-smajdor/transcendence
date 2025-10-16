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

	return container;
}
