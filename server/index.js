import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dbConnector from './src/models/database.js';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import userAuthenticationRoutes from './src/routes/userAuthentication.js';
import friendsRoutes from './src/routes/friendsRoutes.js';
import notificationRoutes from './src/routes/notifications.js';
import messagesRoutes from './src/routes/messagesRoutes.js';
import oauthRoutes from './src/routes/oauthRoutes.js';
import FastifyWebSocket from '@fastify/websocket';
import FastifyEnv from '@fastify/env';
import FastifyStatic from '@fastify/static';
import {
  cleanExpiredTokens,
  isTokenBlacklisted,
} from './src/services/userAuthenticationServices.js';

const fastify = Fastify();

setTimeout(() => {
  cleanExpiredTokens(fastify.db);
}, 60 * 60 * 1000);

// Register .env handling
fastify.register(FastifyEnv, {
  confKey: 'config',
  schema: {
    type: 'object',
    required: [
      'PORT',
      'JWT_SECRET',
      'COOKIES_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
    ],
    properties: {
      PORT: { type: 'number', default: 3000 },
      JWT_SECRET: { type: 'string' },
      COOKIES_SECRET: { type: 'string' },
      GOOGLE_CLIENT_ID: { type: 'string' },
      GOOGLE_CLIENT_SECRET: { type: 'string' },
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
fastify.register(FastifyStatic, {
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads'),
  prefix: '/uploads/',
});
fastify.register(cors, {
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

fastify.addHook('preHandler', (req, res, next) => {
  req.context = req.context || {};
  req.jwt = fastify.jwt;
  return next();
});

fastify.addHook('onRequest', async (req, res) => {
  // Skip WebSocket connections
  if (req.headers.upgrade === 'websocket') {
    return;
  }

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

// Register websockets after database
fastify.register(FastifyWebSocket, {
  options: { clientTracking: true },
});

fastify.register(userAuthenticationRoutes); // /register /login /logout
fastify.register(friendsRoutes); // /friends, /friends/request, /friends/requests, /friends/accept, /friends/reject
fastify.register(notificationRoutes); // /notifications (WebSocket)
fastify.register(messagesRoutes); // /messages, /conversations
fastify.register(oauthRoutes); // /login/google, /auth/google/callback

fastify.get('/', async (req, res) => {
  return res.status(200).send({
    success: true,
    message: 'Welcome to the server',
  });
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  } else {
    console.log(`Server listening on ${fastify.server.address().port}`);
  }
});
