import * as blockingController from '../controllers/blockingController.js';

async function blockingRoutes(fastify) {
  // Block a user
  fastify.post('/block', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await blockingController.blockUserHandler(req, res);
  });

  // Unblock a user
  fastify.post('/unblock', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await blockingController.unblockUserHandler(req, res);
  });

  // Get blocked users list
  fastify.get('/blocked', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await blockingController.getBlockedUsersHandler(req, res);
  });
}

export default blockingRoutes;
