const fastify = require('fastify')()
const fjwt = require('@fastify/jwt')
const fCookie = require('@fastify/cookie')
const dbConnector = require('./src/models/database')
const cors = require('@fastify/cors')
const multipart = require('@fastify/multipart')

const gameChatRoutes = require('./src/routes/gameChat')
const privateChatRoutes = require('./src/routes/privateChat')
const userAuthenticationRoutes = require('./src/routes/userAuthentication')

fastify.register(multipart)
fastify.register(cors, {
	origin: '*',
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
})

// Register websockets
fastify.register(require('@fastify/websocket'), {
	options: { cilentTracking: true },
})

// Register JWT
fastify.register(fjwt, { secret: 'supersecret' })

fastify.addHook('preHandler', (req, res, next) => {
	req.context = req.context || {}
	req.jwt = fastify.jwt
	return next()
})

// Register Cookies
fastify.register(fCookie, {
	secret: 'supersecret',
	hook: 'preHandler',
})

// Register database
fastify.register(dbConnector)

fastify.register(userAuthenticationRoutes) // /register /login /logout
fastify.register(gameChatRoutes) // /gameChat/gameId
fastify.register(privateChatRoutes) // /privateChat/userId

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})
