import { manageGameWebSocket } from "../game/gameWs.js";
import { manageLocalGameWebSocket } from "../game/localGameWs.js";
import { manageLocalGameWebSocketAI } from "../game/aiGameWs.js";
import { initGame } from "../game/gameState.js";
import { PlayersManager } from "../game/players.js";
import { v4 as uuidv4 } from 'uuid';

const games = new Map();
export const clients = new Map();
export const notAuthenticated = new Map();

async function gameRoutes(fastify) {
  fastify.get('/game', { websocket: true }, (connection, req) => {
    const { gameId } = req.query;
    // console.log('Received gameId: ' + gameId);
    const game = games.get(gameId);
    console.log('New WebSocket connection - address:', req.socket.remoteAddress);

    if (!game) {
      connection.send(JSON.stringify({ error: 'Game not found' }));
      connection.close();
      console.log('Game not found');
      return;
    }
	game.gameType = "Duel";
	game.needAuthentication = 1;
    manageGameWebSocket(game, connection, games, gameId, fastify);
  });

  fastify.get('/game/create', async (req, res) => {
    const gameId = uuidv4();
    games.set(gameId, {
      gameState: initGame(),
      clients: new Set(),
      playersManager: new PlayersManager(),
      intervalId: new Set(),
      isRunning: false,
      readyR: false,
      readyL: false,
	  	gameType: "",
	  	needAuthentication: 0 //0 - no, 1 - optional 2 - required 
    });
    console.log(`created gameId: ${gameId}`)
    res.send({ gameId });
  });

  fastify.get('/localgame', { websocket: true }, (connection, req) => {
    const { gameId } = req.query;
    const game = games.get(gameId);
    console.log('New WebSocket connection - address:', req.socket.remoteAddress);

    if (!game) {
      connection.send(JSON.stringify({ error: 'Game not found' }));
      connection.close();
      console.log('Game not found');
      return;
    }
    manageLocalGameWebSocket(game, connection, games, gameId);
  });


  fastify.get('/aigame', { websocket: true }, (connection, req) => {
    const { gameId } = req.query;
    const game = games.get(gameId);
    console.log('New WebSocket connection - address:', req.socket.remoteAddress);

    if (!game) {
      connection.send(JSON.stringify({ error: 'Game not found' }));
      connection.close();
      console.log('Game not found');
      return;
    }
	game.gameType = "CPU";
	game.needAuthentication = 1;
    manageLocalGameWebSocketAI(game, connection, games, gameId, fastify);
  });

  fastify.get('/invitations', { websocket: true }, (connection, req) => {
    let authenticated = false;
    let userId = null;
		let sessionId = null;

    connection.on('message', (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch {
        return;
      }

      if (!authenticated && data.type === 'auth' && data.token) {
        try {
          const decoded = fastify.jwt.verify(data.token, process.env.JWT_SECRET);
          userId = decoded.userId;
          authenticated = true;
          console.log(`User ${userId} has been authorized`);
          clients.set(userId, connection);
					if (sessionId){
						connection.send(JSON.stringify({ type: 'session', sessionId }));
						notAuthenticated.delete(sessionId);
					}
        } catch (err) {
          console.log(`User ${userId} has not been authorized. Closing connection.`);
          connection.close();
        }
        return;
      }

			if (!authenticated && data.type === 'auth') {
				if (!sessionId){
					sessionId = uuidv4;
					notAuthenticated.set(sessionId, connection);
					authenticated = false;
					connection.send(JSON.stringify({ type: 'session', sessionId }));
				}
      	return;
    	}

      if (!authenticated) {
        return;
      }

      if (data.type === 'invite' && data.toUserId) {
        const target = clients.get(data.toUserId);
        if (target) {
          target.send(JSON.stringify({
            type: 'invite',
            fromUserId: userId,
            message: data.message,
          }));
        }
      }

      if (data.type === 'uninvite' && data.toUserId) {
        const target = clients.get(data.toUserId);
        if (target) {
          target.send(JSON.stringify({
            type: 'uninvite',
            fromUserId: userId,
            message: data.message,
          }));
        }
      }

      if (data.type === 'accept' && data.toUserId) {
        const target = clients.get(data.toUserId);
        if (target) {
          target.send(JSON.stringify({
            type: 'game_start',
            fromUserId: userId,
            message: data.message,
          }));
        }
      }

      if (data.type === 'game_start') {
        console.log('Received game_start');
        const target = clients.get(data.toUserId);
        if (target) {
          target.send(JSON.stringify({
            type: 'game_start_with_id',
            fromUserId: userId,
            message: data.message,
            gameId: data.gameId
          }));
          console.log('Sent task to open an overlay with game');
        }
      }
    });

    connection.on('close', () => {
      clients.delete(userId);
			notAuthenticated.delete(sessionId);
    })
  });

  // fastify.post('/game/state', async (req, res) => {
  //   return { status: 'gameState', state: gameState };
  // });

}

export default gameRoutes;
