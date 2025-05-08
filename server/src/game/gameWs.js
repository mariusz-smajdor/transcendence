import { playersManager } from "../game/players.js";
import { gameState, gameLoop, stopGameLoop } from "../game/gameState.js";
import { broadcastGameState, broadcastMessage } from "../game/broadcast.js";

let isRunning = 0;

export function registerGameWebSocket(fastify, clients) {
    fastify.get('/game', { websocket: true }, (connection, req) => {
        console.log('New WebSocket connection - address:', req.socket.remoteAddress);

        playersManager.assignRole(connection);
        clients.add(connection);

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
                gameLoop(clients);
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
                stopGameLoop();
                isRunning = 0;
                broadcastMessage(clients, 'Game stopped. Waiting for a second player to connect');
            }
        });

        connection.on('error', (err) => {
            console.error('WebSocket error:', err);
            clients.delete(connection);
            playersManager.removeRole(connection);
            if (playersManager.leftPlayer == null || playersManager.rightPlayer == null) {
                stopGameLoop();
                isRunning = 0;
                broadcastMessage(clients, 'Game stopped. Waiting for a second player to connect');
            }
        });
    });
}