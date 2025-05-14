import { UIElements, GameState, UIActions } from './game-ui.ts';

type WebSocketDeps = {
    gameId: string,
    type: string,
    ui: UIElements,
    gameState: GameState;
    actions: UIActions;
}

export function setupWebSocket({ gameId, type, ui, gameState, actions }: WebSocketDeps): WebSocket {
    const ws: WebSocket = new WebSocket(
        type === 'network'
            ? `ws://localhost:3000/game?gameId=${gameId}`
            : `ws://localhost:3000/localgame?gameId=${gameId}`
    );

    ws.onmessage = (event: MessageEvent) => {
		try {
			const data = JSON.parse(event.data);

			if (data.type === 'role') {
				gameState.playerRole = data.role;

				if (gameState.playerRole === 'left') {
					ui.roleText.textContent = 'Role: Left player';
				} else if (gameState.playerRole === 'right') {
					ui.roleText.textContent = 'Role: Right player';
				} else {
					ui.roleText.textContent = 'Role: Spectator';
				}

				ui.text.textContent = 'Connected to server!';
			}

			else if (data.type === 'gameState') {
				gameState.leftPaddleY = data.data.paddles.left;
				gameState.rightPaddleY = data.data.paddles.right;
				gameState.ballX = data.data.ball.x;
				gameState.ballY = data.data.ball.y;
				gameState.scoreLeft = data.data.score.left;
				gameState.scoreRight = data.data.score.right;
				gameState.gameOver = data.data.gameOver;
				actions.drawScene();
				
			}

			else if (data.type === 'error') {
				console.error(data.message);
			}

			else if (data.type === 'message') {
				ui.text.textContent = data.message;
			}

		} catch (e) {
			console.error('Error parsing JSON:', e);
			ui.text.textContent = event.data;
		}
	};

	ws.onopen = () => {
		ui.text.textContent = 'Connected to server. Waiting for role assignment...';
	};

	ws.onclose = () => {
		ui.text.textContent = 'Disconnected from server!';
		ui.roleText.textContent = 'Role: disconnected';
	};

    ui.restartBtn.onclick = () => {
		ws.send('RESET');
	};

    return ws;
}