import { createGameUI } from './game-ui';
import { setupWebSocket } from './game-ws';
import {
	setupKeyboardControls,
	setupKeyboardControlsForLocal,
} from './game-keys';
import { GameType } from '../../types/game';

export default function Game(gameId: string, gameType: GameType) {
	if (!gameId || !gameType) {
		console.error('Error: gameId or type missing');
		return;
	}

	const { ui, gameState, actions } = createGameUI(gameType);
	actions.resizeCanvas();
	const ws = setupWebSocket({ gameId, gameType, ui, gameState, actions });
	switch (gameType) {
		case 'local':
			setupKeyboardControlsForLocal(ws);
			break;
		default:
			setupKeyboardControls(ws);
			break;
	}

	requestAnimationFrame(() => {
		actions.resizeCanvas();
	});
	window.addEventListener('resize', actions.resizeCanvas);

	return {
		game: ui.game,
		ws: ws,
	};
}
