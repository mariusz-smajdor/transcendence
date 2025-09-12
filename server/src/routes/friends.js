import {
  sendRequest,
  acceptRequest,
  declineRequest,
  removeFriendship,
  getFriendsList,
  getPendingRequestsList,
  getSentRequestsList,
  searchUsersController,
  getDashboard,
  getFriendshipStatusController,
} from '../controllers/friendsController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { WebSocketService } from '../services/websocketService.js'
import { WebSocketHandler } from '../services/websocketHandler.js'

async function friendsRoutes(fastify, options) {
  // All routes require authentication
  const authOptions = {
    preHandler: [authenticateToken],
  }

  // WebSocket endpoint for real-time notifications
  fastify.register(async function (fastify) {
    await fastify.register(import('@fastify/websocket'))

    fastify.get('/ws', { websocket: true }, (connection, request) => {
      WebSocketHandler.handleConnection(connection, request, fastify)
    })
  })

  // Get dashboard (friends + requests overview)
  fastify.get('/dashboard', authOptions, getDashboard)

  // Friends management
  fastify.get('/', authOptions, getFriendsList)
  fastify.delete('/:friend_id', authOptions, removeFriendship)

  // Friend requests
  fastify.post('/request', authOptions, sendRequest)
  fastify.get('/requests/pending', authOptions, getPendingRequestsList)
  fastify.get('/requests/sent', authOptions, getSentRequestsList)
  fastify.put('/requests/:friendship_id/accept', authOptions, acceptRequest)
  fastify.delete(
    '/requests/:friendship_id/decline',
    authOptions,
    declineRequest
  )

  // Friendship status
  fastify.get('/status/:user_id', authOptions, getFriendshipStatusController)

  // Search users
  fastify.get('/search', authOptions, searchUsersController)

  // WebSocket connection stats (admin endpoint)
  fastify.get('/ws/stats', authOptions, async (request, reply) => {
    try {
      const stats = WebSocketService.getConnectionStats()
      return reply.code(200).send({
        success: true,
        message: 'WebSocket stats retrieved',
        ...stats,
      })
    } catch (error) {
      console.error('WebSocket stats error:', error)
      return reply.code(500).send({
        success: false,
        message: 'Failed to retrieve WebSocket stats',
      })
    }
  })
}

export default friendsRoutes
