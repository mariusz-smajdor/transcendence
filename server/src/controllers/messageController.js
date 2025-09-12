import {
  sendMessage,
  getConversation,
  getConversations,
  markMessagesAsRead,
  getUnreadCount,
  deleteMessage,
  searchMessages,
} from '../services/messageService.js'
import { findUserById } from '../services/userService.js'
import {
  createSuccessResponse,
  createErrorResponse,
} from '../utils/responseHelpers.js'
import {
  validateMessageContent,
  validateUserId,
  validateMessageId,
  validateSearchQuery,
} from '../utils/messageValidation.js'

// Send a message to a friend
export const sendMessageController = async (request, reply) => {
  try {
    const { recipient_id, content, message_type = 'text' } = request.body
    const { user_id: senderId } = request.user

    // Validate input
    const contentValidation = validateMessageContent(content)
    if (!contentValidation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse(
            'Validation failed',
            contentValidation.errors.join(', ')
          )
        )
    }

    const userIdValidation = validateUserId(recipient_id)
    if (!userIdValidation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse(
            'Validation failed',
            userIdValidation.errors.join(', ')
          )
        )
    }

    const recipientId = parseInt(recipient_id)

    // Can't send message to yourself
    if (recipientId === senderId) {
      return reply
        .code(400)
        .send(createErrorResponse('Cannot send message to yourself'))
    }

    // Check if recipient exists
    const recipient = await findUserById(recipientId)
    if (!recipient) {
      return reply.code(404).send(createErrorResponse('Recipient not found'))
    }

    // Send message
    const message = await sendMessage(
      senderId,
      recipientId,
      content,
      message_type
    )

    return reply.code(201).send(
      createSuccessResponse('Message sent successfully', {
        message: {
          message_id: message.message_id,
          sender_id: message.sender_id,
          recipient_id: message.recipient_id,
          content: message.content,
          message_type: message.message_type,
          is_read: message.is_read,
          created_at: message.created_at,
          sender: message.sender,
          recipient: message.recipient,
        },
      })
    )
  } catch (error) {
    console.error('Send message error:', error)
    if (error.message.includes('Can only send messages to friends')) {
      return reply
        .code(403)
        .send(createErrorResponse('Can only send messages to friends'))
    }
    return reply.code(500).send(createErrorResponse('Failed to send message'))
  }
}

// Get conversation between two users
export const getConversationController = async (request, reply) => {
  try {
    const { user_id } = request.params
    const { limit = 50, offset = 0 } = request.query
    const { user_id: currentUserId } = request.user

    // Validate user ID
    const validation = validateUserId(user_id)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    const targetUserId = parseInt(user_id)

    // Can't get conversation with yourself
    if (targetUserId === currentUserId) {
      return reply
        .code(400)
        .send(createErrorResponse('Cannot get conversation with yourself'))
    }

    // Check if target user exists
    const targetUser = await findUserById(targetUserId)
    if (!targetUser) {
      return reply.code(404).send(createErrorResponse('User not found'))
    }

    // Validate pagination parameters
    const messageLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100) // Between 1 and 100
    const messageOffset = Math.max(parseInt(offset) || 0, 0)

    const messages = await getConversation(
      currentUserId,
      targetUserId,
      messageLimit,
      messageOffset
    )

    return reply.code(200).send(
      createSuccessResponse('Conversation retrieved successfully', {
        messages,
        count: messages.length,
        limit: messageLimit,
        offset: messageOffset,
        conversation_with: {
          user_id: targetUser.user_id,
          username: targetUser.username,
          avatar_url: targetUser.avatar_url,
        },
      })
    )
  } catch (error) {
    console.error('Get conversation error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to retrieve conversation'))
  }
}

// Get all conversations for a user
export const getConversationsController = async (request, reply) => {
  try {
    const { user_id: userId } = request.user

    const conversations = await getConversations(userId)

    return reply.code(200).send(
      createSuccessResponse('Conversations retrieved successfully', {
        conversations,
        count: conversations.length,
      })
    )
  } catch (error) {
    console.error('Get conversations error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to retrieve conversations'))
  }
}

// Mark messages as read
export const markMessagesAsReadController = async (request, reply) => {
  try {
    const { user_id } = request.params
    const { user_id: currentUserId } = request.user

    // Validate user ID
    const validation = validateUserId(user_id)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    const senderId = parseInt(user_id)

    // Can't mark messages as read from yourself
    if (senderId === currentUserId) {
      return reply
        .code(400)
        .send(createErrorResponse('Cannot mark messages as read from yourself'))
    }

    const result = await markMessagesAsRead(currentUserId, senderId)

    return reply.code(200).send(
      createSuccessResponse('Messages marked as read', {
        updated_count: result.updated_count,
      })
    )
  } catch (error) {
    console.error('Mark messages as read error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to mark messages as read'))
  }
}

// Get unread message count
export const getUnreadCountController = async (request, reply) => {
  try {
    const { user_id: userId } = request.user

    const unreadCount = await getUnreadCount(userId)

    return reply.code(200).send(
      createSuccessResponse('Unread count retrieved successfully', {
        unread_count: unreadCount,
      })
    )
  } catch (error) {
    console.error('Get unread count error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to retrieve unread count'))
  }
}

// Delete a message
export const deleteMessageController = async (request, reply) => {
  try {
    const { message_id } = request.params
    const { user_id: userId } = request.user

    // Validate message ID
    const validation = validateMessageId(message_id)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    const messageId = parseInt(message_id)

    await deleteMessage(messageId, userId)

    return reply
      .code(200)
      .send(createSuccessResponse('Message deleted successfully'))
  } catch (error) {
    console.error('Delete message error:', error)
    if (
      error.message.includes('not found') ||
      error.message.includes('not authorized')
    ) {
      return reply
        .code(404)
        .send(
          createErrorResponse('Message not found or not authorized to delete')
        )
    }
    return reply.code(500).send(createErrorResponse('Failed to delete message'))
  }
}

// Search messages in a conversation
export const searchMessagesController = async (request, reply) => {
  try {
    const { user_id } = request.params
    const { q: searchTerm, limit = 20 } = request.query
    const { user_id: currentUserId } = request.user

    // Validate user ID
    const userIdValidation = validateUserId(user_id)
    if (!userIdValidation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse(
            'Validation failed',
            userIdValidation.errors.join(', ')
          )
        )
    }

    // Validate search query
    const searchValidation = validateSearchQuery(searchTerm)
    if (!searchValidation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse(
            'Validation failed',
            searchValidation.errors.join(', ')
          )
        )
    }

    const targetUserId = parseInt(user_id)

    // Can't search messages with yourself
    if (targetUserId === currentUserId) {
      return reply
        .code(400)
        .send(createErrorResponse('Cannot search messages with yourself'))
    }

    // Check if target user exists
    const targetUser = await findUserById(targetUserId)
    if (!targetUser) {
      return reply.code(404).send(createErrorResponse('User not found'))
    }

    // Validate limit
    const searchLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50) // Between 1 and 50

    const messages = await searchMessages(
      currentUserId,
      targetUserId,
      searchTerm.trim(),
      searchLimit
    )

    return reply.code(200).send(
      createSuccessResponse('Messages found', {
        messages,
        count: messages.length,
        search_term: searchTerm.trim(),
        limit: searchLimit,
        conversation_with: {
          user_id: targetUser.user_id,
          username: targetUser.username,
          avatar_url: targetUser.avatar_url,
        },
      })
    )
  } catch (error) {
    console.error('Search messages error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to search messages'))
  }
}
