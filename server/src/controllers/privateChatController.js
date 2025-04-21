import {
  handlePrivateChatConnection,
  sendMessageToFriend,
  handlePrivateChatDisconnection,
} from '../services/privateChatService.js';

export const privateChatHandler = (socket, req) => {
  const userId = req.params.userId;

  if (!userId) {
    socket.close(4000, 'User ID is required');
    return;
  }

  handlePrivateChatConnection(userId, socket);

  socket.on('message', (msg) => {
    const parsedMessage = JSON.parse(msg.toString());
    const recipientId = parsedMessage.recipientId;
    const message = parsedMessage.message;

    sendMessageToFriend(userId, recipientId, message);
  });

  socket.on('close', () => {
    handlePrivateChatDisconnection(userId, socket);
  });
};
