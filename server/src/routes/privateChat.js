const { privateChatHandler } = require('../controllers/privateChatController')

async function privateChatRoutes(fastify) {
	fastify.get('/privateChat/:userId', { websocket: true }, privateChatHandler)
}

module.exports = privateChatRoutes
