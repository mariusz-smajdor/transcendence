import { sendInvitation } from '../api/invitationSocket';
import { showGameOverlay } from '../views/game/game-overlay';
import { Toaster } from '../components/toaster';

/**
 * Handles the game_start event when someone accepts your invitation
 * Creates a game and sends the gameId back to the invitee
 */
export async function handleGameAcceptance(fromUserId: number): Promise<void> {
	try {
		const response = await fetch('/api/game/create');
		const respData = await response.json();

		sendInvitation({
			type: 'game_start',
			message: 'Game started',
			toUserId: fromUserId,
			gameId: respData.gameId,
		});

		showGameOverlay(respData.gameId, 'network');
	} catch (error) {
		console.error('Failed to create game:', error);
		Toaster('Failed to start game');
		throw error;
	}
}

/**
 * Handles the game_start_with_id event when you receive a gameId to join
 * Opens the game overlay with the provided gameId
 */
export function handleGameStart(gameId: string): void {
	showGameOverlay(gameId, 'network');
}
