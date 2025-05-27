import { initGame, gameLoop, stopGameLoop, getGameStateProportional } from "../game/gameState.js";
import { broadcastGameState, broadcastMessage } from "../game/broadcast.js";

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
		let authMsg;
		try {
			authMsg = JSON.parse(message);
		} catch (err) {
			console.log("Wrong format of the message - not json");
			//connection.close();
			//return;
		}
		console.log(authMsg);

    	// checking user's token or previous authentication 
		if (!game.playersManager.authenticated.has(connection)) {
			if (authMsg.type === 'auth' && authMsg.token) {
				try {
					let payload = fastify.jwt.verify(authMsg.token);
					console.log(payload);
					game.playersManager.authenticated.set(connection, authMsg.token);
					game.playersManager.setStats(connection,payload);
				} catch (err) {
					console.log(err)
					connection.close();
				}
			} else {
				console.log("not authenticated");
				connection.close();
			}
			return;
			}     
		const msg = message.toString().trim();
		const role = game.playersManager.getRole(connection);
        console.log(`Message received from ${role}:`, msg);
		
		//Readiness
		if (msg === 'READY' && !game.isRunning) {
            if (role === 'left') {
                game.readyL = true;
                broadcastMessage(game.clients, 'left_player_ready');
            }
            if (role === 'right') {
                game.readyR = true;
                broadcastMessage(game.clients, 'right_player_ready');
            }
            if (game.readyL && game.readyR) {
                countdownAndStart(game, fastify.db);
            }
            return;
        }

		//Movement
        if (role === 'left') {
            if (msg === 'UP') {
                game.gameState.paddles.left = Math.max(0, game.gameState.paddles.left - 20);
            } else if (msg === 'DOWN') {
                game.gameState.paddles.left = Math.min(340, game.gameState.paddles.left + 20);
            } 
        } else if (role === 'right') {
            if (msg === 'UP') {
                game.gameState.paddles.right = Math.max(0, game.gameState.paddles.right - 20);
            } else if (msg === 'DOWN') {
                game.gameState.paddles.right = Math.min(340, game.gameState.paddles.right + 20);
            }
        }

		if (msg === 'RESET'){
			game.gameState = initGame();
			game.isRunning = false;
			game.readyL = false;
			game.readyR = false;
			broadcastMessage(game.clients, 'rematch');
			broadcastGameState(game.clients, getGameStateProportional(game.gameState));
		}
    });

    connection.on('close', () => {
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
            game.readyL = false;
            game.readyR = false;
            gameLoop(game, db);
        }
    }
    next();
}
