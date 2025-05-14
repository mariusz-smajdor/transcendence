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
}

export default userAuthenticationRoutes;
