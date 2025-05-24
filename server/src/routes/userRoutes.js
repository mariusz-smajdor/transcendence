import UserController from '../controllers/userController.js';

async function userRoutes(fastify, options) {
  const userController = new UserController(fastify.userServices);

  fastify.post('/users', userController.createUser.bind(userController));
  fastify.get('/users', userController.getAllUsers.bind(userController));
  fastify.get('/users/:id', userController.getUserById.bind(userController));
  fastify.put('/users/:id', userController.updateUser.bind(userController));
  fastify.delete('/users/:id', userController.deleteUser.bind(userController));
}

export default userRoutes;
