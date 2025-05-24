import {
  handlePrivateChatConnection,
  sendMessageToUser,
} from '../services/privateChatService.js';

export const connectToWebsocket = (connection, req, db) => {
  const socket = connection;

  const token = req.cookies?.access_token;
  const decoded = req.server.jwt.decode(token);
  const senderId = decoded?.userId;
  if (!senderId) {
    socket.close(4001, 'Unauthorized: Invalid token');
    return;
  }

  const receiverId = req.params.id;
  if (!receiverId) {
    socket.close(4002, 'Bad Request: Receiver ID is required');
    return;
  }

  if (senderId === receiverId) {
    socket.close(4003, 'Bad Request: Cannot chat with yourself');
    return;
  }

  socket.on('message', (msg) => {
    const message = msg.toString();
    if (!message) return;

    sendMessageToUser(senderId, receiverId, message, db);
  });

  socket.on('close', () => {
    console.log(`Connection closed for user ${senderId}`);
    handlePrivateChatConnection(senderId, socket);
  });

  socket.on('error', (err) => {
    console.log('WebSocket error:', err);
  });
};
