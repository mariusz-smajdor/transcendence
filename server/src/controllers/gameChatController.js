import {
  handleGameChatConnection,
  sendMessageToGameRoom,
  handleGameChatDisconnection,
} from '../services/gameChatService.js';

export const gameChatHandler = (socket, req) => {
  const gameId = req.params.gameId;

  if (!gameId) {
    socket.close(4000, 'Game ID is required');
    return;
  }

  handleGameChatConnection(gameId, socket);

  socket.on('message', (message) => {
    sendMessageToGameRoom(gameId, socket, message);
  });

  socket.on('close', () => {
    handleGameChatDisconnection(gameId, socket);
  });
};
