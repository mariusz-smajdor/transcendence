import { registerGameWebSocket } from "../game/gameWs.js";
import { gameState, gameLoop } from "../game/gameState.js";
import { playersManager } from "../game/players.js";

const clients = new Set();

async function gameRoutes(fastify) {
  registerGameWebSocket(fastify, clients);
  
  // begining of basic REST API
  fastify.post('/game/state', async (req, res) => {
    return { status: 'gameState', state: gameState };
  });
  
}

export default gameRoutes;
