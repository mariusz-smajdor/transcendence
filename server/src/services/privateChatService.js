const privateChats = new Map()

const handlePrivateChatConnection = (userId, socket) => {
	if (!privateChats.has(userId)) {
		privateChats.set(userId, new Set())
	}

	privateChats.get(userId).add(socket)
}

const sendMessageToFriend = (senderId, recipientId, message) => {
	if (!recipientId || !message) {
		return
	}

	if (privateChats.has(recipientId)) {
		privateChats.get(recipientId).forEach((client) => {
			if (client.readyState === 1) {
				client.send(JSON.stringify({ from: senderId, text: message }))
			}
		})
	}
}

const handlePrivateChatDisconnection = (userId, socket) => {
	privateChats.get(userId)?.delete(socket)

	if (privateChats.get(userId).size === 0) {
		privateChats.delete(userId)
	}
}

module.exports = {
	handlePrivateChatConnection,
	sendMessageToFriend,
	handlePrivateChatDisconnection,
}
