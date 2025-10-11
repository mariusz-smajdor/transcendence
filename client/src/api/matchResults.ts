export interface MatchResult {
	id: number;
	opponent: {
		username: string;
		avatar: string;
	};
	playerScore: number;
	opponentScore: number;
	score: string;
	winner: string;
	date: string;
	gameType: string;
	blockchainTx?: string;
}

export interface MatchStats {
	totalMatches: number;
	wins: number;
	losses: number;
	draws: number;
	winRate: number;
}

export async function fetchMatchResults(): Promise<MatchResult[]> {
	try {
		const response = await fetch('/api/match-results', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(data.message || 'Failed to fetch match results');
		}

		return data.matches;
	} catch (error) {
		console.error('Error fetching match results:', error);
		throw error;
	}
}

export async function fetchMatchStats(): Promise<MatchStats> {
	try {
		const response = await fetch('/api/match-stats', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(data.message || 'Failed to fetch match stats');
		}

		return data.stats;
	} catch (error) {
		console.error('Error fetching match stats:', error);
		throw error;
	}
}
