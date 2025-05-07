import { playersManager } from "../game/players.js";
import { gameState, gameLoop, stopGameLoop } from "../game/gameState.js";
import { broadcastGameState } from "../game/broadcast.js";

export function registerGameWebSocket(fastify, clients) {
    fastify.get('/game', { websocket: true }, (connection, req) => {
        console.log('Nowe połączenie WebSocket - adres:', req.socket.remoteAddress);

        playersManager.assignRole(connection);
        clients.add(connection);

        connection.send(JSON.stringify({
            type: 'role',
            role: playersManager.getRole(connection)
        }));
        console.log(`Przydzielona rola: ${playersManager.getRole(connection)}`);

        
        connection.send(JSON.stringify({
            type: 'gameState',
            data: gameState
        }));
        
        let isRunning = 0;

        if (playersManager.leftPlayer != null && playersManager.rightPlayer != null && isRunning != 1) {
            isRunning = 1;
            gameLoop(clients);
        } else {
            console.log("Waiting for second player");
        }

        connection.on('message', message => {
            const msg = message.toString().trim();
            console.log(`Otrzymana wiadomość od ${playersManager.getRole(connection)}:`, msg);

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
            console.log(`Połączenie ${playersManager.getRole(connection)} zamknięte`);
            playersManager.removeRole(connection);
            stopGameLoop();
        });

        connection.on('error', (err) => {
            console.error('WebSocket error:', err);
            clients.delete(connection);
            playersManager.removeRole(connection);
        });
    });
}