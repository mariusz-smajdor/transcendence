import { gameLoop, stopGameLoop } from "../game/gameState.js";
import { broadcastGameState, broadcastMessage } from "../game/broadcast.js";

export function registerGameWebSocket(game, connection, games, gameId) {
    
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

    if (game.playersManager.leftPlayer != null && game.playersManager.rightPlayer != null) {
        if (game.isRunning === false) {
            gameLoop(game);
            game.isRunning = true;
        }
        broadcastMessage(game.clients, 'Game is on!');
    } else {
        broadcastMessage(game.clients, 'Waiting for a second player to connect');
        console.log("Waiting for a second player");
    }

    connection.on('message', message => {
        const msg = message.toString().trim();
        console.log(`Message received from ${game.playersManager.getRole(connection)}:`, msg);

        if (game.playersManager.getRole(connection) === 'left') {
            if (msg === 'UP') {
                game.gameState.paddles.left = Math.max(0, game.gameState.paddles.left - 20);
                broadcastGameState(game.clients, game.gameState);
            } else if (msg === 'DOWN') {
                game.gameState.paddles.left = Math.min(340, game.gameState.paddles.left + 20);
                broadcastGameState(game.clients, game.gameState);
            }
        } else if (game.playersManager.getRole(connection) === 'right') {
            if (msg === 'UP') {
                game.gameState.paddles.right = Math.max(0, game.gameState.paddles.right - 20);
                broadcastGameState(game.clients, game.gameState);
            } else if (msg === 'DOWN') {
                game.gameState.paddles.right = Math.min(340, game.gameState.paddles.right + 20);
                broadcastGameState(game.clients, game.gameState);
            }
        }
    });

    connection.on('close', () => {
        console.log(`Connection ${game.playersManager.getRole(connection)} closed`);
        game.playersManager.removeRole(connection);
        game.clients.delete(connection);
        if (game.playersManager.leftPlayer === null || game.playersManager.rightPlayer === null) {
            stopGameLoop(game);
            game.isRunning = false;
            broadcastMessage(game.clients, 'Game stopped. Waiting for a second player to connect');
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
            broadcastMessage(game.clients, 'Game stopped. Waiting for a second player to connect');
        }
        if (game.playersManager.leftPlayer === null && game.playersManager.rightPlayer === null) {
            games.delete(gameId);
        }
    });
}