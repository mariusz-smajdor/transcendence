import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import fCookie from '@fastify/cookie';
import dbConnector from './src/models/database.js';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import gameChatRoutes from './src/routes/gameChat.js';
import privateChatRoutes from './src/routes/privateChat.js';
import authRoutes from './src/routes/authRoutes.js';
import FastifyWebSocket from '@fastify/websocket';
import oauthPlugin from '@fastify/oauth2';
import path from 'path';
import dotenv from 'dotenv';
import url from 'url';
import fs from 'fs';

// Instantiate fastify
const fastify = Fastify({ logger: true });

// Read the environment
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.resolve(__filename, '..');
const envFilePath = path.resolve(__dirname, '.env');
if (!fs.existsSync(envFilePath)) {
  console.error('Error: .env file not found!');
  process.exit(1);
}
dotenv.config({ path: envFilePath });

fastify.register(fjwt, { secret: process.env.JWT_SECRET });
fastify.register(fCookie, {
  secret: process.env.COOKIES_SECRET,
  hook: 'preHandler',
});
fastify.register(multipart);
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
});
fastify.register(FastifyWebSocket, {
  options: { clientTracking: true },
});

// Register OAuth2
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
  callbackUri: `http://localhost:${
    process.env.PORT || 3000
  }/login/google/callback`,
  callbackUriParams: {
    access_type: 'offline', // Ensures refresh token is sent
  },
});

// Connect database
fastify.register(dbConnector);

// Register routes
fastify.register(authRoutes);
fastify.register(gameChatRoutes);
fastify.register(privateChatRoutes);

fastify.addHook('preHandler', (req, res, next) => {
  req.context = req.context || {};
  req.jwt = fastify.jwt;
  return next();
});

fastify.listen({ port: process.env.PORT || 3000, host: 'localhost' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
