import { manageGameWebSocket } from "../game/gameWs.js";
import { manageLocalGameWebSocket } from "../game/localGameWs.js";
import { manageLocalGameWebSocketAI } from "../game/aiGameWs.js";
import { initGame } from "../game/gameState.js";
import { PlayersManager } from "../game/players.js";
import { v4 as uuidv4 } from 'uuid';

const games = new Map();

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
    manageGameWebSocket(game, connection, games, gameId, fastify);
  });

  fastify.get('/game/create', async (req, res) => {
    const gameId = uuidv4();
    games.set(gameId, {
      gameState: initGame(),
      clients: new Set(),
      playersManager: new PlayersManager(),
      intervalId: null,
      isRunning: false,
      readyR: false,
      readyL: false,
	  gameType: ""
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
    manageLocalGameWebSocketAI(game, connection, games, gameId, fastify);
  });


  // fastify.post('/game/state', async (req, res) => {
  //   return { status: 'gameState', state: gameState };
  // });

}

export default gameRoutes;
