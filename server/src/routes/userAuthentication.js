import * as userAuthController from '../controllers/userAuthenticationController.js';

async function userAuthenticationRoutes(fastify) {
  fastify.post('/register', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.registrationHandler(req, res);
  });
  fastify.post('/login', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.loginHandler(req, res);
  });
  fastify.get('/me', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.meHandler(req, res);
  });
  fastify.post('/logout', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.logoutHandler(req, res);
  });
  // dajcie sobie to w inne miejsce jak chcecie
  fastify.get('/friends', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.getFriendsHandler(req, res);
  });
  fastify.post('/friend-request/send', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.sendFriendRequestHandler(req, res);
  });
  fastify.get('/friend-request/get', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.getFriendRequestsHandler(req, res);
  });
  fastify.post('/friend-request/accept', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.acceptFriendRequestHandler(req, res);
  });
  fastify.post('/friend-request/reject', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await userAuthController.rejectFriendRequestHandler(req, res);
  });

  fastify.get('/login/google/callback', async (req, res) => {
    req.context.config = { db: fastify.db, fastify: fastify };
    userAuthController.loginGoogle(req, res);
  });
}

export default userAuthenticationRoutes;
