import * as notificationsController from '../controllers/notificationsController.js';

async function notificationRoutes(fastify) {
  fastify.get(
    '/notifications',
    { websocket: true },
    async (connection, req) => {
      return await notificationsController.notificationsWebSocketHandler(
        connection,
        req,
        fastify,
      );
    },
  );
}

export default notificationRoutes;
