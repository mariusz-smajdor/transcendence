import {
  googleOAuthHandler,
  googleOAuthCallbackHandler,
} from '../controllers/oauthController.js';

async function oauthRoutes(fastify) {
  // Google OAuth login route
  fastify.get('/login/google', async (req, res) => {
    req.context = req.context || {};
    req.context.config = { db: fastify.db };
    return await googleOAuthHandler(req, res);
  });

  // Google OAuth callback route
  fastify.get('/auth/google/callback', async (req, res) => {
    req.context = req.context || {};
    req.context.config = { db: fastify.db };
    return await googleOAuthCallbackHandler(req, res);
  });
}

export default oauthRoutes;
