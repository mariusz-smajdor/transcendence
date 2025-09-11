import { authenticateToken } from "../game/authentication.js";
import { stopGameLoop , resetGameStatus , gameLoop} from "../game/gameState.js";
import { broadcastMessage } from "../game/broadcast.js";
import { saveClosedMatch } from "../models/gameHistory.js";
import { authenticatePlayer } from "./utils.js";
import { tournamentGameLoop } from "./tournamentLoop.js";


export function tournamentGame(fastify, connection, game, match, room) {
	game.clients.add(connection);
	let first = true;

	connection.on('message', message => {
		let msg;
		try {
			msg = JSON.parse(message);
		} catch (err) {
			console.log("Wrong format of the message - JSON EXPECTED");
			connection.close();
			return;
		}

		if(msg.type == "auth" && first){
			assignPlayer(connection, msg.token,
				msg.sessionId, match, game);
		}
		const role = game.playersManager.getRole(connection);

		// checking user's token or previous authentication
		if (role !== 'spectator' && first){
			authenticatePlayer(game, connection, fastify, msg, match);
		}
		first = false;

		if (msg.type === 'status' && msg.status === 'READY' && !game.isRunning && game.playersManager.playersPresence()) {
			if (role === 'left' && game.readyL === false) {
				game.readyL = true;
				broadcastMessage(game.clients, 'left_player_ready');
				if (game.readyL && game.readyR)
					countdownAndStart(connection, room, match, game, fastify.db);
			}
			if (role === 'right' && game.readyR === false) {
				game.readyR = true;
				broadcastMessage(game.clients, 'right_player_ready');
				if (game.readyL && game.readyR)
					countdownAndStart(connection, room, match, game, fastify.db);
			}
			return;
		}

		//Movement
		if (msg.type === 'move') {
			if (role === 'left') {
				if (msg.direction === 'UP') {
					game.gameState.paddles.left = Math.max(0, game.gameState.paddles.left - 20);
				} else if (msg.direction === 'DOWN') {
					game.gameState.paddles.left = Math.min(340, game.gameState.paddles.left + 20);
				}
			} else if (role === 'right') {
				if (msg.direction === 'UP') {
					game.gameState.paddles.right = Math.max(0, game.gameState.paddles.right - 20);
				} else if (msg.direction === 'DOWN') {
					game.gameState.paddles.right = Math.min(340, game.gameState.paddles.right + 20);
				}
			}
		}
	});

	connection.on('close', () => {
		if (match.winner){
			return;
		}
		const role = game.playersManager.getRole(connection);
		console.log(`Connection ${role} closed`);

		if (match.winner || role === 'spectator'){
			return;
		}

		if(saveClosedMatch(fastify.db,role,))

		
		if (game.isRunning === 1 && role !== 'spectator' &&
			game.playersManager.stats.get('left') !== undefined &&
			game.playersManager.stats.get('right') !== undefined) {
			saveClosedMatch(fastify.db, role, game.playersManager.stats, game.gameType);
		}
		game.playersManager.removePlayer(connection);
		game.clients.delete(connection);
		if (game.isRunning === false && (role === 'left' || role === 'right')) {
			if (game.gameState.score.left === 11 || game.gameState.score.right === 11)
				resetGameStatus(game, false);
			broadcastMessage(game.clients, 'left');
			game.readyL = false;
			game.readyR = false;
		}
		else if (game.playersManager.leftPlayer === null || game.playersManager.rightPlayer === null) {
			stopGameLoop(game);
			game.isRunning = false;
			resetGameStatus(game, false);
		}

		setTimeout(() => {
			if (role === 'left' && !game.playersManager.leftPlayer
				|| role === 'right' && !game.playersManager.rightPlayer)
				broadcastMessage(game.clients, 'waiting_for_second_player');
		}, 3000);

	});

	connection.on('error', (err) => {
		if (match.winner){
			return;
		}
		console.error('WebSocket error:', err);
		const role = game.playersManager.getRole(connection);
		game.playersManager.removeRole(connection);
		game.clients.delete(connection);
		if (game.playersManager.leftPlayer === null || game.playersManager.rightPlayer === null) {
			stopGameLoop(game);
			game.isRunning = false;
			broadcastMessage(game.clients, 'game_stop');
		}
		if (role === 'left'){
			room.matchFinished(-1,11, match);
		}
		else if (role === 'right'){
			room.matchFinished(11,-1, match);
		}
	});
}

function countdownAndStart(connection, room, match, game, db) {
	let count = 3;
	broadcastMessage(game.clients, 'count_to_start');
	function next() {
		if (count > 0) {
			count--;
			setTimeout(next, 1000);
		} else {
			broadcastMessage(game.clients, 'game_on');
			game.isRunning = true;
			tournamentGameLoop(connection, room, match, game, db);
		}
	}
	next();
}

function assignPlayer(connection, token, sessionId, match, game){
	if (token && token == match.leftPlayer.token
		|| sessionId && sessionId == match.leftPlayer.sessionId) {
		game.playersManager.leftPlayer = connection
		game.playersManager.roles.set(connection, 'left')
	}
	else if (token && token == match.rightPlayer.token
		|| sessionId && sessionId == match.rightPlayer.sessionId) {
		game.playersManager.rightPlayer = connection
		game.playersManager.roles.set(connection, 'right')
	}
	else
			game.playersManager.roles.set(connection, 'spectator')

	connection.send(JSON.stringify({
		type: 'role',
		role: game.playersManager.getRole(connection)
	}));

	connection.send(JSON.stringify({
		type: 'gameState',
		data: game.gameState
	}));

	if (game.playersManager.leftPlayer === null || game.playersManager.rightPlayer === null) {
		broadcastMessage(game.clients, 'waiting_for_second_player');
	} else if (game.playersManager.leftPlayer != null && game.playersManager.rightPlayer != null) {
		broadcastMessage(game.clients, 'waiting_for_readiness');
	}
}