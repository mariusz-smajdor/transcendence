import { registerGameWebSocket } from "../game/gameWs.js";
import { gameState } from "../game/gameState.js";

const clients = new Set();

async function gameRoutes(fastify) {
  registerGameWebSocket(fastify, clients);
  
  // begining of basic REST API
  fastify.post('/game/state', async (req, res) => {
    return { status: 'gameState', state: gameState };
  });
  
}

export default gameRoutes;
