import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import dbConnector from './src/models/database.js';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import userAuthenticationRoutes from './src/routes/userAuthentication.js';
import gameRoutes from './src/routes/game.js';
import FastifyWebSocket from '@fastify/websocket';
import FastifyEnv from '@fastify/env';
import {
  cleanExpiredTokens,
  isTokenBlacklisted,
} from './src/services/userAuthenticationServices.js';
import oauthPlugin from '@fastify/oauth2';
import userRoutes from './src/routes/userRoutes.js';
import UserServices from './src/services/userServices.js';
import privateChatRoutes from './src/routes/privateChatRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import MessageServices from './src/services/messageServices.js';

const fastify = Fastify();

setTimeout(() => {
  cleanExpiredTokens(fastify.db);
}, 60 * 60 * 1000);

// Register .env handling
fastify.register(FastifyEnv, {
  confKey: 'config',
  schema: {
    type: 'object',
    required: ['JWT_SECRET', 'COOKIES_SECRET', 'CONTRACT_ADDRESS', 'WALLET_PRIVATE_KEY', 'BLOCKCHAIN_RPC_URL'],
    properties: {
      PORT: { type: 'number', default: 3000 },
      JWT_SECRET: { type: 'string' },
      COOKIES_SECRET: { type: 'string' },
      CONTRACT_ADDRESS: { type: 'string' },
      WALLET_PRIVATE_KEY: { type: 'string' },
      BLOCKCHAIN_RPC_URL: { type: 'string' }
    },
  },
  dotenv: true, // Automatically load .env file
});

// Register .env dependent plugins
fastify.after((err) => {
  if (err) {
    fastify.log.error('Error loading @fastify/env: ', err);
    process.exit(1);
  }

  // Register plugins that depend on fastify.config
  fastify.register(fjwt, { secret: fastify.config.JWT_SECRET });

  fastify.register(fCookie, {
    secret: fastify.config.COOKIES_SECRET,
    hook: 'preHandler',
  });

  fastify.register(oauthPlugin, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/login/google',
    callbackUri: `http://localhost:${process.env.PORT || 3000
      }/login/google/callback`,
    callbackUriParams: {
      access_type: 'offline',
    },
  });
});

fastify.register(FastifyWebSocket, { clientTracking: true });
fastify.register(multipart);
fastify.register(cors, {
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
// Register websockets

fastify.addHook('preHandler', (req, res, next) => {
  req.context = req.context || {};
  req.jwt = fastify.jwt;
  return next();
});

fastify.addHook('onRequest', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token && isTokenBlacklisted(fastify.db, token)) {
    return res
      .status(401)
      .send({ success: false, message: 'Token is blacklisted' });
  }
});

// Register database
fastify.register(dbConnector);

// Inject services
fastify.register(async (fastify) => {
  const userServices = new UserServices(fastify.db);
  const messageServices = new MessageServices(fastify.db);

  fastify.decorate('userServices', userServices);
  fastify.decorate('messageServices', messageServices);
  fastify.register(userRoutes);
  fastify.register(messageRoutes);
});

fastify.register(userAuthenticationRoutes);
fastify.register(gameRoutes);
fastify.register(privateChatRoutes);

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.log('TEST', err);
    fastify.log.error(err);
    process.exit(1);
  } else {
    console.log(`Server listening on ${fastify.server.address().port}`);
  }
});
