import { createGameUI } from './game-ui';
import { setupWebSocket } from './game-ws';
import { setupKeyboardControls } from './game-keys';

export default function Game({ gameId, type }: { gameId: string, type: string }) {
	if (!gameId || !type) {
		console.error('Error: gameId or type missing');
		return;
	}

	const { ui, gameState, actions } = createGameUI();
	actions.resizeCanvas();
	const ws = setupWebSocket({ gameId, type, ui, gameState, actions });
	setupKeyboardControls({ ws, gameState })
	requestAnimationFrame(() => {
		actions.resizeCanvas();
	});
	window.addEventListener('resize', actions.resizeCanvas);

	return ui.game;
}