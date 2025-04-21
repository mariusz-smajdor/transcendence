import { gameChatHandler } from '../controllers/gameChatController.js';

async function gameChatRoutes(fastify) {
  fastify.get('/gameChat/:gameId', { websocket: true }, gameChatHandler);
}

export default gameChatRoutes;
