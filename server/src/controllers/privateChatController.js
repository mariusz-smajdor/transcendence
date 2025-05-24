// privateChatController.js
import {
  handlePrivateChatConnection,
  removeUserConnection,
  sendMessageToUser,
} from '../services/privateChatService.js';

export const connectToWebsocket = (socket, req, db) => {
  console.log('New WebSocket connection established');
  const token = req.cookies?.access_token;
  const decoded = req.server.jwt.decode(token);
  const userId = decoded?.userId;
  if (!userId) {
    socket.close(4001, 'Unauthorized: Invalid token');
    return;
  }
  console.log(`User ID from token: ${userId}`);

  handlePrivateChatConnection(userId, socket);

  socket.on('message', (msg) => {
    const data = JSON.parse(msg.toString());
    const { toUserId, message } = data;

    if (!toUserId || !message) {
      console.log('Invalid message format');
      return;
    }

    console.log(
      `Received message from user ${userId} to ${toUserId}: ${message}`,
    );
    sendMessageToUser(userId, toUserId, message, db);
  });

  socket.on('close', () => {
    console.log(`Connection closed for user ${userId}`);
    removeUserConnection(userId, socket);
  });

  socket.on('error', (err) => {
    console.log('WebSocket error:', err);
  });
};
