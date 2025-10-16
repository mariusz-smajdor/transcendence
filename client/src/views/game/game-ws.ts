import { UIElements, GameState, UIActions, GameType } from '../../types/game';
import { getCookie } from './game-cookies';
import { cleanupKeyboardState } from './game-keys';
import { t } from '../../services/i18n';

type WebSocketDeps = {
	gameId: string;
	gameType: GameType;
	ui: UIElements;
	gameState: GameState;
	actions: UIActions;
	roomId: string | null;
};

type GameMessage = {
	type: 'message';
	message: string;
	player: string;
};

export function setupWebSocket({
	gameId,
	gameType,
	ui,
	gameState,
	actions,
	roomId,
}: WebSocketDeps): WebSocket {
	const ws: WebSocket = new WebSocket(
		roomId
			? `wss://10.12.4.4:8080/tournament/match?gameId=${gameId}&roomId=${roomId}`
			: `${setWebsocketURL(gameType)}${gameId}`
	);

	ws.onmessage = (event: MessageEvent) => {
		try {
			const data = JSON.parse(event.data);

			if (data.type === 'role') {
				gameState.playerRole = data.role;
				console.log(data.role);
				if (gameState.playerRole === 'left') {
					ui.roleText.textContent = t('game.role.left');
				} else if (gameState.playerRole === 'right') {
					ui.roleText.textContent = t('game.role.right');
				} else {
					ui.roleText.textContent = t('game.role.spectator');
				}

				ui.text.textContent = t('game.connected');
			} else if (data.type === 'gameState') {
				gameState.leftPaddleY = data.data.paddles.left;
				gameState.rightPaddleY = data.data.paddles.right;
				gameState.ballX = data.data.ball.x;
				gameState.ballY = data.data.ball.y;
				gameState.scoreLeft = data.data.score.left;
				gameState.scoreRight = data.data.score.right;
				gameState.gameOver = data.data.gameOver;
				actions.drawScene();
			} else if (data.type === 'error') {
				console.error(data.message);
			} else if (data.type === 'message') {
				manageMessage(data, gameState, ui);
			} else if (data.type === 'nickname') {
				gameState.rightPlayerName = data.object.right;
				gameState.leftPlayerName = data.object.left;
				actions.drawScene();
			}
		} catch (e) {
			console.error('Error parsing JSON:', e);
			ui.text.textContent = event.data;
		}
	};

	ws.onopen = () => {
		const token = getCookie('access_token');
		const sessionId = getCookie('sessionId');
		ws.send(JSON.stringify({ type: 'auth', token: token, sessionId }));
		if (gameType === 'network')
			ui.text.textContent =
				'Connected to server. Waiting for role assignment...';
		else ui.text.textContent = t('game.ready');
	};

	ws.onclose = () => {
		ui.text.textContent = t('game.disconnected');
		ui.roleText.textContent = t('game.role.disconnected');
	};

	ui.restartBtn.onclick = () => {
		ws.send(JSON.stringify({ type: 'status', status: 'RESET' }));
	};

	return ws;
}

function manageMessage(
	data: GameMessage,
	gameState: GameState,
	ui: UIElements
) {
	switch (data.message) {
		case 'game_on':
			ui.text.textContent = t('game.isOn');
			break;
		case 'waiting_for_second_player':
			ui.text.textContent = t('game.waitingPlayer');
			break;
		case 'waiting_for_readiness':
			if (gameState.playerRole === 'left' || gameState.playerRole === 'right') {
				ui.text.textContent = t('game.waitingReadyWithAction');
			} else {
				ui.text.textContent = t('game.waitingReady');
			}
			break;
		case 'left_player_ready':
			if (gameState.playerRole === 'right') {
				ui.text.textContent = t('game.leftPlayerReady');
			} else if (gameState.playerRole === 'left') {
				ui.text.textContent = t('game.waitingSecondPlayer');
			}

			break;
		case 'right_player_ready':
			if (gameState.playerRole === 'left') {
				ui.text.textContent = t('game.rightPlayerReady');
			} else if (gameState.playerRole === 'right') {
				ui.text.textContent = t('game.waitingSecondPlayer');
			}
			break;
		case 'count_to_start':
			let count = 3;
			const doCounting = () => {
				if (count > 0) {
					ui.text.textContent = t('game.prepareCountdown').replace('{count}', count.toString());
					count--;
					setTimeout(doCounting, 1000);
				}
			};
			doCounting();
			break;
		case 'game_stop':
			ui.text.textContent =
				'Game stopped. Waiting for a second player to connect';
			break;
		case 'rematch':
			if (gameState.playerRole === 'spectator')
				ui.text.textContent = t('game.rematchProposedSpectator');
			else
				ui.text.textContent = t('game.rematchProposed');
			break;
		case 'winner_left':
			ui.text.textContent = t('game.winnerLeft');
			break;
		case 'winner_right':
			ui.text.textContent = t('game.winnerRight');
			break;
		case 'error_please_reload':
			ui.text.textContent = t('game.errorReload');
			break;
		case 'reset':
			ui.text.textContent = t('game.reset');
			break;
		case 'left':
			ui.text.textContent = 'The oponent left the game';
			break;
		case 'left_player_disconnected':
			// Stop keyboard movement immediately
			cleanupKeyboardState();
			if (gameState.playerRole === 'right') {
				ui.text.textContent = `Your opponent (${gameState.leftPlayerName}) disconnected`;
			} else if (gameState.playerRole === 'spectator') {
				ui.text.textContent = 'Left player disconnected';
			} else {
				ui.text.textContent = 'Player disconnected';
			}
			break;
		case 'right_player_disconnected':
			// Stop keyboard movement immediately
			cleanupKeyboardState();
			if (gameState.playerRole === 'left') {
				ui.text.textContent = `Your opponent (${gameState.rightPlayerName}) disconnected`;
			} else if (gameState.playerRole === 'spectator') {
				ui.text.textContent = 'Right player disconnected';
			} else {
				ui.text.textContent = 'Player disconnected';
			}
			break;
		case 'match_finished':
			ui.text.textContent = 'Result saved! Back to tournament';
			break;
		case 'left_error':
			// Stop keyboard movement immediately
			cleanupKeyboardState();
			if (gameState.playerRole === 'right') {
				ui.text.textContent = `Your opponent (${gameState.leftPlayerName}) left the game. You win by walkover!`;
			} else if (gameState.playerRole === 'spectator') {
				ui.text.textContent = `Walkover! ${gameState.leftPlayerName} left the game. ${gameState.rightPlayerName} wins!`;
			} else {
				ui.text.textContent = 'Match ended - player disconnected';
			}
			break;
		case 'right_error':
			// Stop keyboard movement immediately
			cleanupKeyboardState();
			if (gameState.playerRole === 'left') {
				ui.text.textContent = `Your opponent (${gameState.rightPlayerName}) left the game. You win by walkover!`;
			} else if (gameState.playerRole === 'spectator') {
				ui.text.textContent = `Walkover! ${gameState.rightPlayerName} left the game. ${gameState.leftPlayerName} wins!`;
			} else {
				ui.text.textContent = 'Match ended - player disconnected';
			}
			break;
		default:
			ui.text.textContent = data.message;
			console.warn('Displayed unknown message: ', data.message);
	}
}

function setWebsocketURL(gameType: GameType) {
	switch (gameType) {
		case 'network':
			return 'wss://10.12.4.4:8080/game?gameId=';
		case 'local':
			return 'wss://10.12.4.4:8080/localgame?gameId=';
		case 'ai':
			return 'wss://10.12.4.4:8080/aigame?gameId=';
		case 'tournament':
			return 'wss://10.12.4.4:8080/tournament/match?gameId=';
	}
}
