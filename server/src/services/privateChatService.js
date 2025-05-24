// privateChatService.js
const connectedUsers = new Map();

export const handlePrivateChatConnection = (userId, socket) => {
  console.log(`User ${userId} connected to private chat`);
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }

  connectedUsers.get(userId).add(socket);
};

export const sendMessageToUser = (senderId, receiverId, message, db) => {
  const timestamp = Date.now();

  db.prepare(
    `INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)`,
  ).run(senderId, receiverId, message);

  console.log(`Sending message from ${senderId} to ${receiverId}: ${message}`);
  if (connectedUsers.has(receiverId)) {
    for (const socket of connectedUsers.get(receiverId)) {
      if (socket.readyState === socket.OPEN) {
        socket.send(
          JSON.stringify({
            senderId,
            message,
            timestamp,
          }),
        );
      }
    }
  }
};

export const removeUserConnection = (userId, socket) => {
  const userSockets = connectedUsers.get(userId);
  if (userSockets) {
    userSockets.delete(socket);
    if (userSockets.size === 0) {
      connectedUsers.delete(userId);
    }
  }
};
