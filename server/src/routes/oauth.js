import { googleCallback } from "../controllers/oauthController.js";

async function oauthRoutes(fastify, options) {
  // Only register the callback route - the OAuth2 plugin handles /auth/google automatically
  fastify.get("/auth/google/callback", googleCallback);
}

export default oauthRoutes;
