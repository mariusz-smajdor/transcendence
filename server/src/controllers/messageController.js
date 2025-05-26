class MessageController {
  constructor(messageServices) {
    this.messageServices = messageServices;
  }

  async getMessagesBetweenUsers(request, reply) {
    const { senderId, receiverId } = request.params;
    const messages = await this.messageServices.getMessagesBetweenUsers(
      senderId,
      receiverId,
    );
    reply.send(messages);
  }
}

export default MessageController;
