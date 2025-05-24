import {
  handlePrivateChatConnection,
  sendMessageToUser,
} from '../services/privateChatService.js';

export const connectToWebsocket = (connection, req, db) => {
  const socket = connection;

  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiVHdvalN0YXJ5VG9Lb2JyYSIsImVtYWlsIjoidHdvanN0YXJ5a29icmFAZ3J1YmFzLmNvbSIsImlhdCI6MTc0ODEwMzQ3MiwiZXhwIjoxNzQ4MTA3MDcyfQ.-T6HPEEgOTAStxyP7NQCNcwhxBYfTOWCveSLa8KUzXc';
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

  socket.send(
    JSON.stringify({
      message: 'Siema mordzia, jesteś połączony z czatem prywatnym!',
    }),
  );
};
