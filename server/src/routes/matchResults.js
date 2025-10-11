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
}

export default matchResultsRoutes;
