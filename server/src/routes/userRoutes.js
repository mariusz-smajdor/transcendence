import UserService from '../services/userService.js';
import UserController from '../controllers/userController.js';

async function userRoutes(fastify) {
  const userService = new UserService(fastify.db);
  const userController = new UserController(userService);

  fastify.get('/users/:id', userController.getById);
  fastify.get('/users', userController.getAll);
  fastify.put('/users/:id', userController.updateById);
  fastify.delete('/users/:id', userController.deleteById);
}

export default userRoutes;
