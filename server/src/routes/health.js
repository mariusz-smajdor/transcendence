import { getHealth } from "../controllers/healthController.js";

async function healthRoutes(fastify, options) {
  fastify.get("/health", getHealth);
}

export default healthRoutes;
