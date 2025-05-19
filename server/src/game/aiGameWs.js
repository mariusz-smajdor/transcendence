import { gameLoop, stopGameLoop } from "../game/gameState.js";
import { broadcastMessage } from "../game/broadcast.js";
export function manageLocalGameWebSocketAI(game, connection, games, gameId) {
	
	game.clients.add(connection);

	connection.send(JSON.stringify({
		type: 'gameState',
		data: game.gameState
	}));

	connection.on('message', message => {
		const msg = message.toString().trim();
		const role = game.playersManager.getRole(connection);
		console.log(`Message received from ${role}:`, msg); // ask
		console.log(`${connection.clients}`)
		//Readiness
		if (msg === 'READY' && !game.isRunning) {
			countdownAndStart(game);
		}

		//Movement
		if (msg === 'UP') {
			game.gameState.paddles.left = Math.max(0, game.gameState.paddles.left - 20);
		} else if (msg === 'DOWN') {
			game.gameState.paddles.left = Math.min(340, game.gameState.paddles.left + 20);
		}
	});

	connection.on('close', () => {
		game.clients.delete(connection);
		games.delete(gameId);
	});

	connection.on('error', (err) => {
		console.error('WebSocket error:', err);
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
			game.readyL = false;
			game.readyR = false;
			gameLoop(game,true);
		}
	}

	next();
}