const gameChats = new Map();

export const handleGameChatConnection = (gameId, socket) => {
  if (!gameChats.has(gameId)) {
    gameChats.set(gameId, new Set());
  }

  gameChats.get(gameId).add(socket);
};

export const sendMessageToGameRoom = (gameId, socket, message) => {
  gameChats.get(gameId)?.forEach((client) => {
    if (client !== socket && client.readyState === 1) {
      client.send(message.toString());
    }
  });
};

export const handleGameChatDisconnection = (gameId, socket) => {
  gameChats.get(gameId)?.delete(socket);

  if (gameChats.get(gameId).size === 0) {
    gameChats.delete(gameId);
  }
};
