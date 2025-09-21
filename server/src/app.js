import fastify from 'fastify'
import { initDatabase } from './database/init.js'
import healthRoutes from './routes/health.js'
import userRoutes from './routes/users.js'
import friendsRoutes from './routes/friends.js'
import { messageRoutes } from './routes/messages.js'
import { getOAuthConfig, validateOAuthConfig } from './config/oauthConfig.js'
import cors from '@fastify/cors'
import { invitations } from './routes/invitations.js'
import { tournamentRoutes } from './routes/tournament.js'
import gameRoutes from './routes/game.js'
import fastifyWebsocket from '@fastify/websocket'

const server = fastify()

// Initialize the server
const initializeServer = async () => {
  // --- 1️⃣ Register CORS first ---
  await server.register(cors, {
    origin: 'http://localhost:8080', // must include protocol
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  await server.register(import('@fastify/cookie'), {
    secret: 'change-this-later',
    parseOptions: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })

  // --- 2️⃣ Register JWT plugin ---
  await server.register(import('fastify-jwt'), {
    secret:
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    cookie: {
      cookieName: 'access_token',
      signed: true,
    },
  })

  await server.register(fastifyWebsocket)

  // --- 3️⃣ Register OAuth2 plugin ---
  const oauthConfig = getOAuthConfig()
  const configValidation = validateOAuthConfig(oauthConfig)

  if (!configValidation.isValid) {
    console.warn(
      'OAuth configuration issues:',
      configValidation.errors.join(', ')
    )
  }

  const fastifyOAuth2 = await import('@fastify/oauth2')
  await server.register(fastifyOAuth2.default, {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: oauthConfig.google.clientId,
        secret: oauthConfig.google.clientSecret,
      },
      auth: oauthConfig.google.auth,
    },
    startRedirectPath: '/auth/google',
    callbackUri: oauthConfig.google.redirectUri,
    scope: oauthConfig.google.scopes,
  })

  // --- 4️⃣ Initialize database ---
  await initDatabase()

  // --- 5️⃣ Register routes ---
  server.register(healthRoutes, { prefix: '/api/health' })
  server.register(userRoutes, { prefix: '/api/users' })
  server.register(import('./routes/oauth.js'), { prefix: '/api/oauth' })
  server.register(friendsRoutes, { prefix: '/api/friends' })
  server.register(messageRoutes, { prefix: '/api/messages' })
  server.register(invitations)
  server.register(tournamentRoutes)
  server.register(gameRoutes)

  return server
}

export default initializeServer
