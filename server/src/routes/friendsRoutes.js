import * as friendsController from '../controllers/friendsController.js';

async function friendsRoutes(fastify) {
  // Get friends list
  fastify.get('/friends', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await friendsController.getFriendsHandler(req, res);
  });

  // Send friend request
  fastify.post('/friends/request', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await friendsController.sendFriendRequestHandler(req, res);
  });

  // Get friend requests
  fastify.get('/friends/requests', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await friendsController.getFriendRequestsHandler(req, res);
  });

  // Accept friend request
  fastify.post('/friends/accept', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await friendsController.acceptFriendRequestHandler(req, res);
  });

  // Reject friend request
  fastify.post('/friends/reject', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await friendsController.rejectFriendRequestHandler(req, res);
  });

  // Remove friend
  fastify.delete('/friends', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await friendsController.removeFriendHandler(req, res);
  });
}

export default friendsRoutes;
