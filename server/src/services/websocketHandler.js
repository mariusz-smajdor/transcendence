import { WebSocketService } from './websocketService.js'
import { notifyFriendsOnlineStatus } from './friendsService.js'

/**
 * WebSocket connection handler for friends system
 */
export class WebSocketHandler {
  /**
   * Handle WebSocket connection establishment
   * @param {Object} connection - Fastify WebSocket connection object
   * @param {Object} request - Fastify request object
   * @param {Object} fastify - Fastify instance
   */
  static async handleConnection(connection, request, fastify) {
    try {
      // Authenticate connection
      const userId = await this.authenticateConnection(
        connection,
        request,
        fastify
      )

      // Setup connection
      this.setupConnection(connection, userId)

      // Send connection confirmation
      this.sendConnectionConfirmation(connection, userId)
    } catch (error) {
      this.handleConnectionError(connection, error)
    }
  }

  /**
   * Authenticate WebSocket connection
   * @param {Object} connection - WebSocket connection
   * @param {Object} request - Request object
   * @param {Object} fastify - Fastify instance
   * @returns {number} User ID
   */
  static async authenticateConnection(connection, request, fastify) {
    const token = request.query.token

    if (!token) {
      this.closeConnection(connection, 1008, 'Authentication token required')
      throw new Error('No authentication token provided')
    }

    try {
      const decoded = fastify.jwt.verify(token)
      return decoded.user_id
    } catch (error) {
      this.closeConnection(connection, 1008, 'Invalid authentication token')
      throw new Error('Invalid authentication token')
    }
  }

  /**
   * Setup WebSocket connection and event handlers
   * @param {Object} connection - WebSocket connection
   * @param {number} userId - User ID
   */
  static setupConnection(connection, userId) {
    const socket = this.getSocket(connection)

    // Add to WebSocket service
    WebSocketService.addConnection(userId, socket)

    // Notify friends that user is online
    notifyFriendsOnlineStatus(userId, true)

    // Setup event handlers
    this.setupEventHandlers(connection, socket, userId)
  }

  /**
   * Setup WebSocket event handlers
   * @param {Object} connection - WebSocket connection
   * @param {Object} socket - WebSocket socket
   * @param {number} userId - User ID
   */
  static setupEventHandlers(connection, socket, userId) {
    // Handle connection close
    socket.on('close', () => {
      this.handleConnectionClose(connection, userId)
    })

    // Handle connection errors
    socket.on('error', (error) => {
      this.handleConnectionError(connection, error, userId)
    })

    // Handle incoming messages
    socket.on('message', (message) => {
      this.handleMessage(connection, message, userId)
    })
  }

  /**
   * Handle connection close
   * @param {Object} connection - WebSocket connection
   * @param {number} userId - User ID
   */
  static handleConnectionClose(connection, userId) {
    const socket = this.getSocket(connection)
    WebSocketService.removeConnection(userId, socket)

    // Notify friends that user is offline (with delay for reconnections)
    setTimeout(() => {
      if (!WebSocketService.isUserOnline(userId)) {
        notifyFriendsOnlineStatus(userId, false)
      }
    }, 5000)
  }

  /**
   * Handle connection errors
   * @param {Object} connection - WebSocket connection
   * @param {Error} error - Error object
   * @param {number} userId - User ID (optional)
   */
  static handleConnectionError(connection, error, userId = null) {
    console.error(`WebSocket error for user ${userId || 'unknown'}:`, error)

    if (userId) {
      const socket = this.getSocket(connection)
      WebSocketService.removeConnection(userId, socket)
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param {Object} connection - WebSocket connection
   * @param {Buffer} message - Message buffer
   * @param {number} userId - User ID
   */
  static handleMessage(connection, message, userId) {
    try {
      const data = JSON.parse(message.toString())

      if (data.type === 'ping') {
        this.sendPong(connection)
      }
    } catch (error) {
      console.error('WebSocket message parsing error:', error)
    }
  }

  /**
   * Send connection confirmation message
   * @param {Object} connection - WebSocket connection
   * @param {number} userId - User ID
   */
  static sendConnectionConfirmation(connection, userId) {
    const message = {
      type: 'connection_established',
      data: {
        user_id: userId,
        timestamp: new Date().toISOString(),
      },
    }

    this.sendMessage(connection, message)
  }

  /**
   * Send pong response
   * @param {Object} connection - WebSocket connection
   */
  static sendPong(connection) {
    const message = {
      type: 'pong',
      timestamp: new Date().toISOString(),
    }

    this.sendMessage(connection, message)
  }

  /**
   * Send message through WebSocket connection
   * @param {Object} connection - WebSocket connection
   * @param {Object} message - Message object
   */
  static sendMessage(connection, message) {
    const socket = this.getSocket(connection)
    const sendMethod = socket.send || connection.send

    if (sendMethod) {
      sendMethod.call(socket || connection, JSON.stringify(message))
    }
  }

  /**
   * Close WebSocket connection
   * @param {Object} connection - WebSocket connection
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   */
  static closeConnection(connection, code, reason) {
    const socket = this.getSocket(connection)
    const closeMethod = socket?.close || connection.close

    if (closeMethod) {
      closeMethod.call(socket || connection, code, reason)
    }
  }

  /**
   * Get WebSocket socket from connection object
   * @param {Object} connection - WebSocket connection
   * @returns {Object} WebSocket socket
   */
  static getSocket(connection) {
    return connection.socket || connection
  }
}
