import { createGameUI } from './game-ui';
import { setupWebSocket } from './game-ws';
import { setupKeyboardControls, setupKeyboardControlsForLocal, setupKeyboardControlsForAI } from './game-keys';
import { GameType } from '../../types/game';

export default function Game(gameId: string, gameType: GameType) {
	if (!gameId || !gameType) {
		console.error('Error: gameId or type missing');
		return;
	}

	const { ui, gameState, actions } = createGameUI(gameType);
	actions.resizeCanvas();
	const ws = setupWebSocket({ gameId, gameType, ui, gameState, actions });
	switch (gameType){ //ask
		case 'network':
			setupKeyboardControls(ws, gameState);
			break;
		case 'local':
			setupKeyboardControlsForLocal(ws);
			break;
		case 'ai':
			setupKeyboardControlsForAI(ws)
	}

	requestAnimationFrame(() => {
		actions.resizeCanvas();
	});
	window.addEventListener('resize', actions.resizeCanvas);

	return ui.game;
}