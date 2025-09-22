import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import dbConnector from './src/models/database.js';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import userAuthenticationRoutes from './src/routes/userAuthentication.js';
import FastifyWebSocket from '@fastify/websocket';
import FastifyEnv from '@fastify/env';
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
  allowedHeaders: ['Content-Type', 'Authorization'],
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

fastify.register(userAuthenticationRoutes); // /register /login /logout

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
