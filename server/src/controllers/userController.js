class UserController {
  constructor(userServices) {
    this.userServices = userServices;
  }

  async createUser(request, reply) {
    const user = await this.userServices.createUser(request.body);
    reply.status(201).send(user);
  }

  async getAllUsers(request, reply) {
    const users = await this.userServices.getAllUsers();
    reply.send(users);
  }

  async getUserById(request, reply) {
    const user = await this.userServices.getUserById(request.params.id);
    if (!user) {
      reply.status(404).send({ message: 'User not found' });
      return;
    }
    reply.send(user);
  }

  async updateUser(request, reply) {
    const updatedUser = await this.userServices.updateUser(
      request.params.id,
      request.body,
    );
    if (!updatedUser) {
      reply.status(404).send({ message: 'User not found' });
      return;
    }
    reply.send(updatedUser);
  }

  async deleteUser(request, reply) {
    const result = await this.userServices.deleteUser(request.params.id);
    if (!result) {
      reply.status(404).send({ message: 'User not found' });
      return;
    }
    reply.send({ message: 'User deleted', user: result });
  }
}

export default UserController;
