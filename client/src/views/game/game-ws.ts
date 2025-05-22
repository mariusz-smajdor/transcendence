import { UIElements, GameState, UIActions, GameType } from '../../types/game';

type WebSocketDeps = {
	gameId: string;
	gameType: GameType;
	ui: UIElements;
	gameState: GameState;
	actions: UIActions;
}

type GameMessage = {
	type: 'message';
	message: string;
	player: string;
}

export function setupWebSocket({ gameId, gameType, ui, gameState, actions }: WebSocketDeps): WebSocket {
	const ws: WebSocket = new WebSocket(
		`${setWebsocketURL(gameType)}${gameId}`);

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
				manageMessage(data, gameState, ui);
			}

		} catch (e) {
			console.error('Error parsing JSON:', e);
			ui.text.textContent = event.data;
		}
	};

	ws.onopen = () => {
		if (gameType === 'network')
			ui.text.textContent = 'Connected to server. Waiting for role assignment...';
		else
			ui.text.textContent = 'Game ready. Press \'R\' to start.';
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

function manageMessage(data: GameMessage, gameState: GameState, ui: UIElements) {
	switch (data.message) {
		case 'game_on':
			ui.text.textContent = 'Game is on!';
			break;
		case 'waiting_for_second_player':
			ui.text.textContent = 'Waiting for a second player to join.';
			break;
		case 'waiting_for_readiness':
			if (gameState.playerRole === 'left' || gameState.playerRole === 'right') {
				ui.text.textContent = 'Waiting for players to confirm they are ready. Press \'R\' if you are ready.';
			} else {
				ui.text.textContent = 'Waiting for players to confirm they are ready.';
			}
			break;
		case 'left_player_ready':
			if (gameState.playerRole === 'right') {
				ui.text.textContent = 'Left player is ready. Press \'R\' if you are ready.';
			}
			break;
		case 'right_player_ready':
			if (gameState.playerRole === 'left') {
				ui.text.textContent = 'Right player is ready. Press \'R\' if you are ready.';
			}
			break;
		case 'count_to_start':
			let count = 3;
			const doCounting = () => {
				if (count > 0) {
					ui.text.textContent = `Prepare yourself! Game starts in ${count}`;
					count--;
					setTimeout(doCounting, 1000);
				}
			};
			doCounting();
			break;
		case 'game_stop':
			ui.text.textContent = 'Game stopped. Waiting for a second player to connect';
			break;
		case 'rematch':
			if (gameState.playerRole === 'left' || gameState.playerRole === 'right')
				ui.text.textContent = 'Rematch proposed! Press \'R\' if you are ready.';
			else
				ui.text.textContent = 'Rematch proposed! Waiting for players to confirm.';
			break;
		case 'winner_left':
			ui.text.textContent = 'Left player won!';
			break;
		case 'winner_right':
			ui.text.textContent = 'Right player won!';
			break;
		case 'error_please_reload':
			ui.text.textContent = 'Error occured. Please reload game.';
			break;
		default:
			ui.text.textContent = data.message;
			console.warn('Displayed unknown message: ', data.message);
	}
}

function setWebsocketURL(gameType: GameType)
{
	switch(gameType){
		case 'network':
			return "ws://localhost:3000/game?gameId=";
		case 'local':
			return "ws://localhost:3000/localgame?gameId=";
		case 'ai':
			return "ws://localhost:3000/aigame?gameId=";
	}
}