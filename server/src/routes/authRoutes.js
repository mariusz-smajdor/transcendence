import AuthController from '../controllers/authController.js';
import User from '../models/userModel.js';

async function authRoutes(fastify) {
  const authController = new AuthController(fastify);

  fastify.post('/register', authController.register.bind(authController));
  fastify.post('/login', authController.login.bind(authController));
  fastify.get(
    '/login/google/callback',
    authController.loginGoogle.bind(authController),
  );
}

export default authRoutes;
