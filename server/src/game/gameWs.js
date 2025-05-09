import { gameLoop, stopGameLoop } from "../game/gameState.js";
import { broadcastGameState, broadcastMessage } from "../game/broadcast.js";

export function registerGameWebSocket(game, connection, games, gameId) {
    let clients = game.clients;
    let playersManager = game.playersManager;
    let gameState = game.gameState;
    let isRunning = game.isRunning
    
    clients.add(connection);
    playersManager.assignRole(connection);

    connection.send(JSON.stringify({
        type: 'role',
        role: playersManager.getRole(connection)
    }));
    console.log(`Role assigned: ${playersManager.getRole(connection)}`);


    connection.send(JSON.stringify({
        type: 'gameState',
        data: gameState
    }));

    if (playersManager.leftPlayer != null && playersManager.rightPlayer != null) {
        if (isRunning != 1) {
            gameLoop(game);
        }
        isRunning = 1;
        broadcastMessage(clients, 'Game is on!');
    } else {
        broadcastMessage(clients, 'Waiting for a second player to connect');
        console.log("Waiting for second player");
    }

    connection.on('message', message => {
        const msg = message.toString().trim();
        console.log(`Message received from ${playersManager.getRole(connection)}:`, msg);

        if (playersManager.getRole(connection) === 'left') {
            if (msg === 'UP') {
                gameState.paddles.left = Math.max(0, gameState.paddles.left - 20);
                broadcastGameState(clients, gameState);
            } else if (msg === 'DOWN') {
                gameState.paddles.left = Math.min(340, gameState.paddles.left + 20);
                broadcastGameState(clients, gameState);
            }
        } else if (playersManager.getRole(connection) === 'right') {
            if (msg === 'UP') {
                gameState.paddles.right = Math.max(0, gameState.paddles.right - 20);
                broadcastGameState(clients, gameState);
            } else if (msg === 'DOWN') {
                gameState.paddles.right = Math.min(340, gameState.paddles.right + 20);
                broadcastGameState(clients, gameState);
            }
        }
    });

    connection.on('close', () => {
        console.log(`Connection ${playersManager.getRole(connection)} closed`);
        playersManager.removeRole(connection);
        if (playersManager.leftPlayer == null || playersManager.rightPlayer == null) {
            stopGameLoop(game);
            isRunning = 0;
            broadcastMessage(clients, 'Game stopped. Waiting for a second player to connect');
        }
        if (playersManager.leftPlayer == null && playersManager.rightPlayer == null) {
            games.delete(gameId);
        }
    });

    connection.on('error', (err) => {
        console.error('WebSocket error:', err);
        clients.delete(connection);
        playersManager.removeRole(connection);
        if (playersManager.leftPlayer == null || playersManager.rightPlayer == null) {
            stopGameLoop(game);
            isRunning = 0;
            broadcastMessage(clients, 'Game stopped. Waiting for a second player to connect');
        }
        if (playersManager.leftPlayer == null && playersManager.rightPlayer == null) {
            games.delete(gameId);
        }
    });
}