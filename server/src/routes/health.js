import { getHealth } from '../controllers/healthController.js'

async function healthRoutes(fastify, options) {
  fastify.get('/', getHealth)
}

export default healthRoutes
