import { connectToWebsocket } from '../controllers/privateChatController.js';

async function privateChatRoutes(fastify) {
  fastify.get('/message/:id', { websocket: true }, (connection, req) => {
    // console.log('Connection', connection);
    // console.log('Websocket', connection.websocket);
    const db = fastify.db;
    connectToWebsocket(connection, req, db);
  });
}

export default privateChatRoutes;
