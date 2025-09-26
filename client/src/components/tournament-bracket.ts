import { type ComponentProps } from '../types/component';
import { Card } from './card';
import { Text } from './text';
import { Button } from './button';

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
	onLeaveTournament: () => void;
	onPlayMatch: () => void;
};

type BracketMatch = {
	id: string;
	player1?: string;
	player2?: string;
	winner?: string;
	round: 'quarter' | 'semi' | 'final';
	position: { x: number; y: number };
};

function getMatchWinner(
	matchId: string,
	matchResults: MatchResult[]
): string | null {
	console.log(`🔍 Debug: getMatchWinner called for matchId: ${matchId}`, {
		matchResults,
		searchingFor: matchId,
	});

	const result = matchResults.find((r) => r.matchId === matchId);
	console.log(`🔍 Debug: Found result for ${matchId}:`, result);

	return result ? result.winner : null;
}

function createBracketMatches(
	numberOfPlayers: number,
	players: string[],
	matchResults: MatchResult[] = []
): BracketMatch[] {
	console.log('🔍 Debug: createBracketMatches called with:', {
		numberOfPlayers,
		players,
		matchResults,
	});

	const matches: BracketMatch[] = [];

	if (numberOfPlayers === 4) {
		// Semi finals (first stage for 4 players)
		matches.push(
			{
				id: 'sf1',
				player1: players[0] || 'Waiting for player...',
				player2: players[1] || 'Waiting for player...',
				round: 'semi',
				position: { x: 0, y: 0 },
			},
			{
				id: 'sf2',
				player1: players[2] || 'Waiting for player...',
				player2: players[3] || 'Waiting for player...',
				round: 'semi',
				position: { x: 0, y: 1 },
			}
		);

		// Final - use actual winners from semifinals
		const sf1Winner = getMatchWinner('sf1', matchResults);
		const sf2Winner = getMatchWinner('sf2', matchResults);

		console.log('🔍 Debug: 4-player final check:', {
			sf1Winner,
			sf2Winner,
			bothCompleted: sf1Winner && sf2Winner,
		});

		if (sf1Winner && sf2Winner) {
			// Both semifinals completed, show actual players
			console.log(
				'🔍 Debug: Creating final match with actual players:',
				sf1Winner,
				'vs',
				sf2Winner
			);
			matches.push({
				id: 'final',
				player1: sf1Winner || 'Waiting for player...',
				player2: sf2Winner || 'Waiting for player...',
				round: 'final',
				position: { x: 1, y: 0.5 },
			});
		} else {
			// Semifinals not completed yet, show placeholder
			console.log('🔍 Debug: Creating final match with TBD placeholder');
			matches.push({
				id: 'final',
				winner: 'TBD',
				round: 'final',
				position: { x: 1, y: 0.5 },
			});
		}
	} else if (numberOfPlayers === 8) {
		// Quarter finals
		for (let i = 0; i < 8; i += 2) {
			matches.push({
				id: `qf${i / 2 + 1}`,
				player1: players[i] || 'Waiting for player...',
				player2: players[i + 1] || 'Waiting for player...',
				round: 'quarter',
				position: { x: 0, y: i / 2 },
			});
		}

		// Semi finals - use actual winners from quarterfinals
		const qf1Winner = getMatchWinner('qf1', matchResults);
		const qf2Winner = getMatchWinner('qf2', matchResults);
		const qf3Winner = getMatchWinner('qf3', matchResults);
		const qf4Winner = getMatchWinner('qf4', matchResults);

		if (qf1Winner && qf2Winner) {
			matches.push({
				id: 'sf1',
				player1: qf1Winner || 'Waiting for player...',
				player2: qf2Winner || 'Waiting for player...',
				round: 'semi',
				position: { x: 1, y: 0.5 },
			});
		} else {
			matches.push({
				id: 'sf1',
				winner: 'TBD',
				round: 'semi',
				position: { x: 1, y: 0.5 },
			});
		}

		if (qf3Winner && qf4Winner) {
			matches.push({
				id: 'sf2',
				player1: qf3Winner || 'Waiting for player...',
				player2: qf4Winner || 'Waiting for player...',
				round: 'semi',
				position: { x: 1, y: 1.5 },
			});
		} else {
			matches.push({
				id: 'sf2',
				winner: 'TBD',
				round: 'semi',
				position: { x: 1, y: 1.5 },
			});
		}

		// Final - use actual winners from semifinals
		const sf1Winner = getMatchWinner('sf1', matchResults);
		const sf2Winner = getMatchWinner('sf2', matchResults);

		if (sf1Winner && sf2Winner) {
			matches.push({
				id: 'final',
				player1: sf1Winner || 'Waiting for player...',
				player2: sf2Winner || 'Waiting for player...',
				round: 'final',
				position: { x: 2, y: 1 },
			});
		} else {
			matches.push({
				id: 'final',
				winner: 'TBD',
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
	const card = Card({
		classes: [
			'min-w-[120px]',
			'min-h-[40px]',
			'flex',
			'flex-col',
			'items-center',
			'justify-center',
			'text-center',
			'border-2',
			'border-gray-600',
			'bg-gray-800',
			'text-white',
			'text-sm',
			'font-medium',
			...classes,
		],
	});

	if (match.player1 && match.player2) {
		// Show both players
		const player1Text = Text({
			content: match.player1,
			classes: ['text-xs', 'mb-1'],
		});
		const vsText = Text({
			content: 'vs',
			classes: ['text-xs', 'text-gray-400', 'mb-1'],
		});
		const player2Text = Text({ content: match.player2, classes: ['text-xs'] });

		card.appendChild(player1Text);
		card.appendChild(vsText);
		card.appendChild(player2Text);
	} else if (match.winner) {
		// Show winner placeholder
		const winnerText = Text({ content: match.winner, classes: ['text-xs'] });
		card.appendChild(winnerText);
	}

	return card;
}

export function TournamentBracket({
	numberOfPlayers,
	playersIn,
	players,
	matchResults = [],
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
