import fastify from 'fastify'
import { initDatabase } from './database/init.js'
import healthRoutes from './routes/health.js'
import userRoutes from './routes/users.js'
import friendsRoutes from './routes/friends.js'
import { messageRoutes } from './routes/messages.js'
import { getOAuthConfig, validateOAuthConfig } from './config/oauthConfig.js'

const server = fastify()

// Initialize the server
const initializeServer = async () => {
  // Register JWT plugin
  await server.register(import('fastify-jwt'), {
    secret:
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  })

  // Register OAuth2 plugin
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

  // Initialize database
  await initDatabase()

  // Register routes
  server.register(healthRoutes, { prefix: '/api/health' })
  server.register(userRoutes, { prefix: '/api/users' })
  server.register(import('./routes/oauth.js'), { prefix: '/api/oauth' })
  server.register(friendsRoutes, { prefix: '/api/friends' })
  server.register(messageRoutes, { prefix: '/api/messages' })

  return server
}

export default initializeServer
