import { gameLoop, resetGameStatus, stopGameLoop } from "../game/gameState.js";
import { broadcastMessage } from "../game/broadcast.js";
import { initGame } from "../game/gameState.js";
import { broadcastGameState } from "../game/broadcast.js";

export function manageLocalGameWebSocket(game, connection, games, gameId) {

	game.clients.add(connection);
	game.playersManager.assignRole(connection);

	connection.send(JSON.stringify({
		type: 'gameState',
		data: game.gameState
	}));

	connection.on('message', message => {
		const msg = JSON.parse(message);
		const role = game.playersManager.getRole(connection);
		console.log(`Message received from ${role}:`, msg);

		//Readiness
		if (msg.type === 'status' && msg.status === 'READY' && !game.isRunning) {
			if (game.readyL === false) {
				countdownAndStart(game);
				game.readyL = true;
			}
		}

		//Movement
		if (msg.type === 'move') {
			if (msg.direction === 'LEFT_UP') {
				game.gameState.paddles.left = Math.max(0, game.gameState.paddles.left - 20);
			} else if (msg.direction === 'LEFT_DOWN') {
				game.gameState.paddles.left = Math.min(340, game.gameState.paddles.left + 20);
			} else if (msg.direction === 'RIGHT_UP') {
				game.gameState.paddles.right = Math.max(0, game.gameState.paddles.right - 20);
			} else if (msg.direction === 'RIGHT_DOWN') {
				game.gameState.paddles.right = Math.min(340, game.gameState.paddles.right + 20);
			}
		}

		if (msg.type === 'status' && msg.status === 'RESET') {
			resetGameStatus(game);
		}

	});

	connection.on('close', () => {
		stopGameLoop(game);
		game.clients.delete(connection);
		games.delete(gameId);
	});

	connection.on('error', (err) => {
		console.error('WebSocket error:', err);
		stopGameLoop(game);
		game.clients.delete(connection);
		games.delete(gameId);
		broadcastMessage(game.clients, 'error_please_reload');
	});
}

function countdownAndStart(game) {
	let count = 3;
	broadcastMessage(game.clients, 'count_to_start');
	function next() {
		if (count > 0) {
			count--;
			setTimeout(next, 1000);
		} else {
			broadcastMessage(game.clients, 'game_on');
			game.isRunning = true;
			gameLoop(game);
		}
	}

	next();
}