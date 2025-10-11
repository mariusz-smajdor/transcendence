import * as messagesController from '../controllers/messagesController.js';

async function messagesRoutes(fastify) {
  fastify.post('/messages', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await messagesController.sendMessageHandler(req, res);
  });

  fastify.get('/messages', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await messagesController.getMessagesHandler(req, res);
  });

  fastify.get('/conversations', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await messagesController.getConversationsHandler(req, res);
  });

  fastify.post('/messages/read', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await messagesController.markAsReadHandler(req, res);
  });
}

export default messagesRoutes;
