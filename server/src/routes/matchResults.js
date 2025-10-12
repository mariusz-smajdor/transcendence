import * as matchResultsController from '../controllers/matchResultsController.js';

async function matchResultsRoutes(fastify) {
  // Get match results for authenticated user
  fastify.get('/match-results', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await matchResultsController.getMatchResultsHandler(req, res);
  });

  // Get match statistics for authenticated user
  fastify.get('/match-stats', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await matchResultsController.getMatchStatsHandler(req, res);
  });

  // Get friend's match history and stats
  fastify.get('/friend/:friendId/match-history', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await matchResultsController.getFriendMatchHistoryHandler(req, res);
  });

  // Debug endpoint to check friends
  fastify.get('/debug/friends', async (req, res) => {
    req.context.config = { db: fastify.db };
    return await matchResultsController.getDebugFriendsHandler(req, res);
  });
}

export default matchResultsRoutes;
