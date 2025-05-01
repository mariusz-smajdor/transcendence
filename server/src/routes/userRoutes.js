import UserService from '../services/userService.js';
import UserController from '../controllers/userController.js';

async function userRoutes(fastify) {
  const userService = new UserService(fastify.db);
  const userController = new UserController(userService);

  fastify.get('/users/:id', userController.getById);
}

export default userRoutes;
