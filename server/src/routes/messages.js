import {
  sendMessageController,
  getConversationController,
  getConversationsController,
  markMessagesAsReadController,
  getUnreadCountController,
  deleteMessageController,
  searchMessagesController,
} from '../controllers/messageController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

// Message routes with authentication
export const messageRoutes = async (fastify) => {
  // Send a message to a friend
  fastify.post('/send', {
    preHandler: [authenticateToken],
    handler: sendMessageController,
    schema: {
      body: {
        type: 'object',
        required: ['recipient_id', 'content'],
        properties: {
          recipient_id: { type: 'integer', minimum: 1 },
          content: { type: 'string', minLength: 1, maxLength: 2000 },
          message_type: {
            type: 'string',
            enum: ['text', 'image', 'file'],
            default: 'text',
          },
        },
      },
    },
  })

  // Get conversation between two users
  fastify.get('/conversation/:user_id', {
    preHandler: [authenticateToken],
    handler: getConversationController,
    schema: {
      params: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'integer', minimum: 1 },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
  })

  // Get all conversations for a user
  fastify.get('/conversations', {
    preHandler: [authenticateToken],
    handler: getConversationsController,
  })

  // Mark messages as read from a specific user
  fastify.put('/read/:user_id', {
    preHandler: [authenticateToken],
    handler: markMessagesAsReadController,
    schema: {
      params: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'integer', minimum: 1 },
        },
      },
    },
  })

  // Get unread message count
  fastify.get('/unread-count', {
    preHandler: [authenticateToken],
    handler: getUnreadCountController,
  })

  // Delete a message
  fastify.delete('/:message_id', {
    preHandler: [authenticateToken],
    handler: deleteMessageController,
    schema: {
      params: {
        type: 'object',
        required: ['message_id'],
        properties: {
          message_id: { type: 'integer', minimum: 1 },
        },
      },
    },
  })

  // Search messages in a conversation
  fastify.get('/search/:user_id', {
    preHandler: [authenticateToken],
    handler: searchMessagesController,
    schema: {
      params: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'integer', minimum: 1 },
        },
      },
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 1, maxLength: 100 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
      },
    },
  })
}
