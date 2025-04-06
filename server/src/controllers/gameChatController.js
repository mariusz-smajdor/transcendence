const {
	handleGameChatConnection,
	sendMessageToGameRoom,
	handleGameChatDisconnection,
} = require('../services/gameChatService')

const gameChatHandler = (socket, req) => {
	const gameId = req.params.gameId

	if (!gameId) {
		socket.close(4000, 'Game ID is required')
		return
	}

	handleGameChatConnection(gameId, socket)

	socket.on('message', (message) => {
		sendMessageToGameRoom(gameId, socket, message)
	})

	socket.on('close', () => {
		handleGameChatDisconnection(gameId, socket)
	})
}

module.exports = { gameChatHandler }
