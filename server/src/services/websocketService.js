// WebSocket connection management
const connections = new Map() // userId -> Set of WebSocket connections

export class WebSocketService {
  static addConnection(userId, websocket) {
    if (!connections.has(userId)) {
      connections.set(userId, new Set())
    }
    connections.get(userId).add(websocket)

    console.log(
      `User ${userId} connected via WebSocket. Total connections: ${
        connections.get(userId).size
      }`
    )
  }

  static removeConnection(userId, websocket) {
    if (connections.has(userId)) {
      connections.get(userId).delete(websocket)
      if (connections.get(userId).size === 0) {
        connections.delete(userId)
      }
      console.log(`User ${userId} disconnected from WebSocket`)
    }
  }

  static sendToUser(userId, message) {
    if (connections.has(userId)) {
      const userConnections = connections.get(userId)
      const messageStr = JSON.stringify(message)

      // Send to all user's connections (multiple tabs/devices)
      userConnections.forEach((websocket) => {
        if (websocket.readyState === websocket.OPEN) {
          try {
            websocket.send(messageStr)
          } catch (error) {
            console.error(`Failed to send message to user ${userId}:`, error)
            this.removeConnection(userId, websocket)
          }
        } else {
          // Remove closed connections
          this.removeConnection(userId, websocket)
        }
      })

      console.log(`Sent message to user ${userId}:`, message.type)
      return true
    }
    return false
  }

  static sendToMultipleUsers(userIds, message) {
    const results = userIds.map((userId) => ({
      userId,
      sent: this.sendToUser(userId, message),
    }))

    return results
  }

  static broadcastToAll(message) {
    const connectedUsers = Array.from(connections.keys())
    return this.sendToMultipleUsers(connectedUsers, message)
  }

  static getConnectedUsers() {
    return Array.from(connections.keys())
  }

  static getUserConnectionCount(userId) {
    return connections.has(userId) ? connections.get(userId).size : 0
  }

  static isUserOnline(userId) {
    return connections.has(userId) && connections.get(userId).size > 0
  }

  static getConnectionStats() {
    return {
      totalUsers: connections.size,
      totalConnections: Array.from(connections.values()).reduce(
        (sum, userConnections) => sum + userConnections.size,
        0
      ),
      userStats: Array.from(connections.entries()).map(
        ([userId, userConnections]) => ({
          userId,
          connections: userConnections.size,
        })
      ),
    }
  }
}

// Message types for friends system and messaging
export const WEBSOCKET_MESSAGE_TYPES = {
  FRIEND_REQUEST_RECEIVED: 'friend_request_received',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
  FRIEND_REQUEST_DECLINED: 'friend_request_declined',
  FRIEND_REMOVED: 'friend_removed',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  FRIENDS_LIST_UPDATE: 'friends_list_update',
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  MESSAGE_DELETED: 'message_deleted',
}
