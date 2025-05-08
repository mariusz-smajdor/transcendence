import { registerGameWebSocket } from "../game/gameWs.js";
import { playersManager } from "../game/players.js";
import { gameState, updateGameState , getGameStateProportional} from "../game/gameState.js";
import { broadcastGameState } from "../game/broadcast.js";

const clients = new Set();

async function gameRoutes(fastify) {
  registerGameWebSocket(fastify, clients);
  
  // begining of basic REST API
  fastify.post('/game/state', async (req, res) => {
    return { status: 'gameState', state: gameState };
  });
  
}

export default gameRoutes;
