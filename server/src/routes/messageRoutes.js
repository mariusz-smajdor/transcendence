import MessageController from '../controllers/messageController.js';

async function messageRoutes(fastify, options) {
  const messageController = new MessageController(fastify.messageServices);

  fastify.get(
    '/messages/:senderId/:receiverId',
    messageController.getMessagesBetweenUsers.bind(messageController),
  );
}

export default messageRoutes;
