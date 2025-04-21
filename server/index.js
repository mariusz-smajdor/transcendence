import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import dbConnector from './src/models/database.js';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import gameChatRoutes from './src/routes/gameChat.js';
import privateChatRoutes from './src/routes/privateChat.js';
import userAuthenticationRoutes from './src/routes/userAuthentication.js';
import FastifyWebSocket from '@fastify/websocket';
import FastifyEnv from '@fastify/env';

const fastify = Fastify();

// Register .env handling
fastify.register(FastifyEnv, {
  confKey: 'config',
  schema: {
    type: 'object',
    required: ['JWT_SECRET', 'COOKIES_SECRET'],
    properties: {
      PORT: { type: 'number', default: 3000 },
      JWT_SECRET: { type: 'string' },
      COOKIES_SECRET: { type: 'string' },
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
});

fastify.register(multipart);
fastify.register(cors, {
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
});

// Register websockets
fastify.register(FastifyWebSocket, {
  options: { clientTracking: true },
});

fastify.addHook('preHandler', (req, res, next) => {
  req.context = req.context || {};
  req.jwt = fastify.jwt;
  return next();
});

// Register database
fastify.register(dbConnector);

fastify.register(userAuthenticationRoutes); // /register /login /logout
fastify.register(gameChatRoutes); // /gameChat/gameId
fastify.register(privateChatRoutes); // /privateChat/userId

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
