import { initGame, gameLoop, stopGameLoop, getGameStateProportional, resetGameStatus } from "../game/gameState.js";
import { broadcastGameState, broadcastMessage, broadcastStatus } from "../game/broadcast.js";
import { authenticateToken } from "./authentication.js";
import { saveClosedMatch } from "../models/gameHistory.js";

export function manageGameWebSocket(game, connection, games, gameId, fastify) {
    
    game.clients.add(connection);
    game.playersManager.assignRole(connection);

    connection.send(JSON.stringify({
        type: 'role',
        role: game.playersManager.getRole(connection)
    }));
    console.log(`Role assigned: ${game.playersManager.getRole(connection)}`);

    connection.send(JSON.stringify({
        type: 'gameState',
        data: game.gameState
    }));

	if (game.isRunning === true){
		broadcastMessage(game.clients, 'game_on');
	} else if (game.playersManager.leftPlayer === null || game.playersManager.rightPlayer === null){
        console.log("Waiting for a second player");
        broadcastMessage(game.clients, 'waiting_for_second_player');
	} else if(game.playersManager.leftPlayer != null && game.playersManager.rightPlayer != null){
		broadcastMessage(game.clients, 'waiting_for_readiness');
	}

    connection.on('message', message => {
		//parsing json message
		let msg;
		try {
			msg = JSON.parse(message);
		} catch (err) {
			console.log("Wrong format of the message - JSON EXPECTED");
			//connection.close();
			//return;
		}

		const role = game.playersManager.getRole(connection);
    	// checking user's token or previous authentication
		if (role !== 'spectator' && game.needAuthentication !== 0)
			authenticateToken(game,connection,fastify,msg);

        console.log(`Message received from ${role}:`, msg);
		//Readiness

		if (msg.type === 'status' && msg.status === 'READY' && !game.isRunning) {
			if (role === 'left' && game.readyL === false) {
				game.readyL = true;
                broadcastMessage(game.clients, 'left_player_ready');
				if (game.readyL && game.readyR)
					countdownAndStart(game, fastify.db);
			}
            if (role === 'right' && game.readyR === false) {
				game.readyR = true;
                broadcastMessage(game.clients, 'right_player_ready');
				if (game.readyL && game.readyR)
					countdownAndStart(game, fastify.db);
            }
            return;
        }

		//Movement
		if (msg.type === 'move'){
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
		if (msg.type === 'status' && msg.status === 'RESET'){
			resetGameStatus(game);
		}

    });

    connection.on('close', () => {
		const role = game.playersManager.getRole(connection);
		if(game.isRunning === 1 && role !== 'spectator' && 
			game.playersManager.stats.get('left') !== undefined &&
			game.playersManager.stats.get('right') !== undefined)
			saveClosedMatch(fastify.db, role, game.playersManager.stats, game.gameType);
        console.log(`Connection ${game.playersManager.getRole(connection)} closed`);
        game.playersManager.removeRole(connection);
        game.clients.delete(connection);
        if (game.playersManager.leftPlayer === null || game.playersManager.rightPlayer === null) {
            stopGameLoop(game);
            game.isRunning = false;
            broadcastMessage(game.clients, 'game_stop');
        }
        if (game.playersManager.leftPlayer === null && game.playersManager.rightPlayer === null) {
            games.delete(gameId);
        }
    });

    connection.on('error', (err) => {
        console.error('WebSocket error:', err);
        game.playersManager.removeRole(connection);
        game.clients.delete(connection);
        if (game.playersManager.leftPlayer === null || game.playersManager.rightPlayer === null) {
            stopGameLoop(game);
            game.isRunning = false;
            broadcastMessage(game.clients, 'game_stop');
        }
        if (game.playersManager.leftPlayer === null && game.playersManager.rightPlayer === null) {
            games.delete(gameId);
        }
    });
}

function countdownAndStart(game, db) {
    broadcastMessage(game.clients, `count_to_start`);
    let count = 3;

    function next() {
        if (count > 0) {
            count--;
            setTimeout(next, 1000);
        } else {
            broadcastMessage(game.clients, 'game_on');
            game.isRunning = true;
            gameLoop(game, db);
        }
    }
    next();
}
