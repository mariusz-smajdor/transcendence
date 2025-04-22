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
import path from 'path';
import dotenv from 'dotenv';

// Instantiate fastify
const fastify = Fastify();

// Read the environment
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.resolve(__filename, '..');
const envFilePath = resolve(__dirname, '.env');
if (!existsSync(envFilePath)) {
  console.error(`Error: .env file not found at ${envFilePath}`);
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

fastify.register(dbConnector);

// Register routes
fastify.register(userAuthenticationRoutes);
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
