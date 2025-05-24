import { connectToWebsocket } from '../controllers/privateChatController.js';

async function privateChatRoutes(fastify) {
  fastify.get('/message', { websocket: true }, (connection, req) => {
    const db = fastify.db;
    connectToWebsocket(connection, req, db);
  });
}

export default privateChatRoutes;
