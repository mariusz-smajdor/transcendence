import { gameLoop, stopGameLoop } from "../game/gameState.js";
import { broadcastMessage } from "../game/broadcast.js";
export function manageLocalGameWebSocketAI(game, connection, games, gameId, fastify) {
	
	game.clients.add(connection);

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
			countdownAndStart(game, fastify.db);
		}

		//Movement
		if (msg.type === 'move'){
			if (msg.direction === 'UP') {
				game.gameState.paddles.left = Math.max(0, game.gameState.paddles.left - 20);
			} else if (msg.direction === 'DOWN') {
				game.gameState.paddles.left = Math.min(340, game.gameState.paddles.left + 20);
			}
		}

		if (msg.type === 'status' && msg.status === 'RESET'){
			//rematch logic
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

function countdownAndStart(game, db) {
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
			gameLoop(game, db,true);
		}
	}

	next();
}