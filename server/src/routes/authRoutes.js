import AuthController from '../controllers/authController.js';
import User from '../models/userModel.js';

async function authRoutes(fastify) {
  const authController = new AuthController(fastify);

  // POST /register
  fastify.post('/register', authController.register.bind(authController));

  // POST /login
  fastify.post('/login', authController.login.bind(authController));

  // GET /login/google/callback
  fastify.get(
    '/login/google/callback',
    authController.loginGoogle.bind(authController),
  );
}

export default authRoutes;
