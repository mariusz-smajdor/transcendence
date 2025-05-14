import { GameState } from './game-ui.ts';

type KeyboardControlsDeps = {
    ws: WebSocket,
    gameState: GameState,
}

export function setupKeyboardControls({ ws, gameState }: KeyboardControlsDeps) {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
		//Movement
		if (gameState.playerRole === 'left') {
			if (e.key === 'w' || e.key === 'ArrowUp') {
				ws.send('UP');
			}
			if (e.key === 's' || e.key === 'ArrowDown') {
				ws.send('DOWN');
			}
		}
		else if (gameState.playerRole === 'right') {
			if (e.key === 'w' || e.key === 'ArrowUp') {
				ws.send('UP');
			}
			if (e.key === 'w' || e.key === 'ArrowDown') {
				ws.send('DOWN');
			}
		}
		//Readiness
		if (e.key === 'r' || e.key === 'R') {
			ws.send('READY');
		}
	});
}