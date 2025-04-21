import { privateChatHandler } from '../controllers/privateChatController.js';

async function privateChatRoutes(fastify) {
  fastify.get('/privateChat/:userId', { websocket: true }, privateChatHandler);
}

export default privateChatRoutes;
