const { gameChatHandler } = require('../controllers/gameChatController')

async function gameChatRoutes(fastify) {
	fastify.get('/gameChat/:gameId', { websocket: true }, gameChatHandler)
}

module.exports = gameChatRoutes
