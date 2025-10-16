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
import gameRoutes from './src/routes/game.js';
import { avatarRoutes } from './src/routes/avatar.js';
import matchResultsRoutes from './src/routes/matchResults.js';
import blockingRoutes from './src/routes/blockingRoutes.js';
import FastifyWebSocket from '@fastify/websocket';
import FastifyEnv from '@fastify/env';
import FastifyStatic from '@fastify/static';
import {
  cleanExpiredTokens,
  isTokenBlacklisted,
} from './src/services/userAuthenticationServices.js';
import { invitations } from './src/routes/invitations.js';
import { tournamentRoutes } from './src/routes/tournament.js';
import fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      'certs',
      'server.key',
    ),
  ),
  cert: fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      'certs',
      'server.crt',
    ),
  ),
};

const fastify = Fastify({
  https: httpsOptions,
});

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
      'CLIENT_URL',
    ],
    properties: {
      PORT: { type: 'number', default: 3000 },
      JWT_SECRET: { type: 'string' },
      COOKIES_SECRET: { type: 'string' },
      GOOGLE_CLIENT_ID: { type: 'string' },
      GOOGLE_CLIENT_SECRET: { type: 'string' },
      CLIENT_URL: { type: 'string' },
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

fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
fastify.register(FastifyStatic, {
  root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads'),
  prefix: '/uploads/',
});
fastify.after(() => {
  fastify.register(cors, {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:8080',
        'https://localhost:8080',
        fastify.config.CLIENT_URL,
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
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
fastify.register(gameRoutes);
fastify.register(avatarRoutes); // /avatar/proxy
fastify.register(matchResultsRoutes); // /match-results, /match-stats
fastify.register(blockingRoutes); // /block, /unblock, /blocked
fastify.register(invitations);
fastify.register(tournamentRoutes);

fastify.get('/', async (req, res) => {
  return res.status(200).send({
    success: true,
    message: 'Welcome to the server',
  });
});

// Cleanup endpoint for orphaned avatar files (admin/maintenance)
fastify.get('/cleanup-avatars', async (req, res) => {
  try {
    const { cleanupOrphanedAvatars } = await import(
      './src/utils/avatarCleanup.js'
    );
    cleanupOrphanedAvatars(fastify.db);
    return res.status(200).send({
      success: true,
      message: 'Avatar cleanup completed',
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).send({
      success: false,
      message: 'Cleanup failed',
    });
  }
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  } else {
    console.log(
      `Server listening on ${fastify.server.address().address}:${
        fastify.server.address().port
      }`,
    );
  }
});
