import { db } from '../database/init.js'
import { getFriendshipStatus } from './friendsService.js'
import {
  WebSocketService,
  WEBSOCKET_MESSAGE_TYPES,
} from './websocketService.js'

// Send a message to a friend
export const sendMessage = async (
  senderId,
  recipientId,
  content,
  messageType = 'text'
) => {
  return new Promise((resolve, reject) => {
    // First check if users are friends
    getFriendshipStatus(senderId, recipientId)
      .then((friendship) => {
        if (!friendship || friendship.status !== 'accepted') {
          reject(new Error('Can only send messages to friends'))
          return
        }

        const sql = `
          INSERT INTO messages (sender_id, recipient_id, content, message_type) 
          VALUES (?, ?, ?, ?)
        `

        db.run(
          sql,
          [senderId, recipientId, content, messageType],
          async function (err) {
            if (err) {
              reject(err)
            } else {
              try {
                // Get message details with user info
                const message = await getMessageById(this.lastID)

                // Send real-time notification to recipient
                WebSocketService.sendToUser(recipientId, {
                  type: WEBSOCKET_MESSAGE_TYPES.NEW_MESSAGE,
                  data: {
                    message: {
                      message_id: message.message_id,
                      sender_id: message.sender_id,
                      recipient_id: message.recipient_id,
                      content: message.content,
                      message_type: message.message_type,
                      is_read: message.is_read,
                      created_at: message.created_at,
                      sender: {
                        user_id: message.sender.user_id,
                        username: message.sender.username,
                        avatar_url: message.sender.avatar_url,
                      },
                    },
                  },
                })

                resolve(message)
              } catch (notificationError) {
                console.error(
                  'Failed to send message notification:',
                  notificationError
                )
                // Still resolve the message even if notification fails
                const message = await getMessageById(this.lastID)
                resolve(message)
              }
            }
          }
        )
      })
      .catch((error) => {
        reject(error)
      })
  })
}

// Get conversation between two users
export const getConversation = async (
  userId1,
  userId2,
  limit = 50,
  offset = 0
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        m.message_id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.message_type,
        m.is_read,
        m.created_at,
        m.updated_at,
        sender.user_id as sender_user_id,
        sender.username as sender_username,
        sender.avatar_url as sender_avatar_url,
        recipient.user_id as recipient_user_id,
        recipient.username as recipient_username,
        recipient.avatar_url as recipient_avatar_url
      FROM messages m
      JOIN users sender ON m.sender_id = sender.user_id
      JOIN users recipient ON m.recipient_id = recipient.user_id
      WHERE (m.sender_id = ? AND m.recipient_id = ?) 
         OR (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `

    db.all(
      sql,
      [userId1, userId2, userId2, userId1, limit, offset],
      (err, rows) => {
        if (err) {
          reject(err)
        } else {
          const messages = (rows || []).map((row) => ({
            message_id: row.message_id,
            sender_id: row.sender_id,
            recipient_id: row.recipient_id,
            content: row.content,
            message_type: row.message_type,
            is_read: Boolean(row.is_read),
            created_at: row.created_at,
            updated_at: row.updated_at,
            sender: {
              user_id: row.sender_user_id,
              username: row.sender_username,
              avatar_url: row.sender_avatar_url,
            },
            recipient: {
              user_id: row.recipient_user_id,
              username: row.recipient_username,
              avatar_url: row.recipient_avatar_url,
            },
          }))
          resolve(messages.reverse()) // Return in chronological order
        }
      }
    )
  })
}

// Get all conversations for a user (list of people they've messaged with)
export const getConversations = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      WITH conversation_partners AS (
        SELECT DISTINCT
          CASE 
            WHEN m.sender_id = ? THEN m.recipient_id
            ELSE m.sender_id
          END as other_user_id
        FROM messages m
        WHERE m.sender_id = ? OR m.recipient_id = ?
      )
      SELECT 
        cp.other_user_id,
        u.username as other_username,
        u.avatar_url as other_avatar_url,
        MAX(m.created_at) as last_message_time,
        (
          SELECT content 
          FROM messages m2 
          WHERE ((m2.sender_id = ? AND m2.recipient_id = cp.other_user_id) 
                 OR (m2.sender_id = cp.other_user_id AND m2.recipient_id = ?))
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message_content,
        (
          SELECT message_type 
          FROM messages m3 
          WHERE ((m3.sender_id = ? AND m3.recipient_id = cp.other_user_id) 
                 OR (m3.sender_id = cp.other_user_id AND m3.recipient_id = ?))
          ORDER BY m3.created_at DESC 
          LIMIT 1
        ) as last_message_type,
        (
          SELECT COUNT(*) 
          FROM messages m4 
          WHERE m4.recipient_id = ? AND m4.sender_id = cp.other_user_id AND m4.is_read = 0
        ) as unread_count
      FROM conversation_partners cp
      JOIN users u ON cp.other_user_id = u.user_id
      LEFT JOIN messages m ON ((m.sender_id = ? AND m.recipient_id = cp.other_user_id) 
                               OR (m.sender_id = cp.other_user_id AND m.recipient_id = ?))
      GROUP BY cp.other_user_id, u.username, u.avatar_url
      ORDER BY last_message_time DESC
    `

    db.all(
      sql,
      [
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
        userId,
      ],
      (err, rows) => {
        if (err) {
          reject(err)
        } else {
          const conversations = (rows || []).map((row) => ({
            other_user: {
              user_id: row.other_user_id,
              username: row.other_username,
              avatar_url: row.other_avatar_url,
            },
            last_message: {
              content: row.last_message_content,
              message_type: row.last_message_type,
              created_at: row.last_message_time,
            },
            unread_count: row.unread_count,
          }))
          resolve(conversations)
        }
      }
    )
  })
}

// Mark messages as read
export const markMessagesAsRead = async (userId, senderId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE messages 
      SET is_read = 1, updated_at = CURRENT_TIMESTAMP 
      WHERE recipient_id = ? AND sender_id = ? AND is_read = 0
    `

    db.run(sql, [userId, senderId], async function (err) {
      if (err) {
        reject(err)
      } else {
        try {
          // Notify sender that their messages were read
          if (this.changes > 0) {
            WebSocketService.sendToUser(senderId, {
              type: WEBSOCKET_MESSAGE_TYPES.MESSAGE_READ,
              data: {
                read_by: userId,
                read_at: new Date().toISOString(),
                updated_count: this.changes,
              },
            })
          }

          resolve({
            success: true,
            updated_count: this.changes,
          })
        } catch (notificationError) {
          console.error('Failed to send read notification:', notificationError)
          resolve({
            success: true,
            updated_count: this.changes,
          })
        }
      }
    })
  })
}

// Get unread message count for a user
export const getUnreadCount = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) as unread_count
      FROM messages 
      WHERE recipient_id = ? AND is_read = 0
    `

    db.get(sql, [userId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row.unread_count || 0)
      }
    })
  })
}

// Delete a message (only sender can delete)
export const deleteMessage = async (messageId, userId) => {
  return new Promise((resolve, reject) => {
    // First get message details for notification
    const getMessageSql = `
      SELECT recipient_id FROM messages 
      WHERE message_id = ? AND sender_id = ?
    `

    db.get(getMessageSql, [messageId, userId], (err, message) => {
      if (err) {
        reject(err)
        return
      }

      if (!message) {
        reject(new Error('Message not found or not authorized to delete'))
        return
      }

      const deleteSql = `
        DELETE FROM messages 
        WHERE message_id = ? AND sender_id = ?
      `

      db.run(deleteSql, [messageId, userId], async function (err) {
        if (err) {
          reject(err)
        } else if (this.changes === 0) {
          reject(new Error('Message not found or not authorized to delete'))
        } else {
          try {
            // Notify recipient that message was deleted
            WebSocketService.sendToUser(message.recipient_id, {
              type: WEBSOCKET_MESSAGE_TYPES.MESSAGE_DELETED,
              data: {
                message_id: messageId,
                deleted_by: userId,
                deleted_at: new Date().toISOString(),
              },
            })

            resolve({ success: true })
          } catch (notificationError) {
            console.error(
              'Failed to send delete notification:',
              notificationError
            )
            resolve({ success: true })
          }
        }
      })
    })
  })
}

// Get message by ID with user details
export const getMessageById = async (messageId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        m.message_id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.message_type,
        m.is_read,
        m.created_at,
        m.updated_at,
        sender.user_id as sender_user_id,
        sender.username as sender_username,
        sender.avatar_url as sender_avatar_url,
        recipient.user_id as recipient_user_id,
        recipient.username as recipient_username,
        recipient.avatar_url as recipient_avatar_url
      FROM messages m
      JOIN users sender ON m.sender_id = sender.user_id
      JOIN users recipient ON m.recipient_id = recipient.user_id
      WHERE m.message_id = ?
    `

    db.get(sql, [messageId], (err, row) => {
      if (err) {
        reject(err)
      } else if (!row) {
        reject(new Error('Message not found'))
      } else {
        const message = {
          message_id: row.message_id,
          sender_id: row.sender_id,
          recipient_id: row.recipient_id,
          content: row.content,
          message_type: row.message_type,
          is_read: Boolean(row.is_read),
          created_at: row.created_at,
          updated_at: row.updated_at,
          sender: {
            user_id: row.sender_user_id,
            username: row.sender_username,
            avatar_url: row.sender_avatar_url,
          },
          recipient: {
            user_id: row.recipient_user_id,
            username: row.recipient_username,
            avatar_url: row.recipient_avatar_url,
          },
        }
        resolve(message)
      }
    })
  })
}

// Search messages in a conversation
export const searchMessages = async (
  userId1,
  userId2,
  searchTerm,
  limit = 20
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        m.message_id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.message_type,
        m.is_read,
        m.created_at,
        sender.username as sender_username,
        sender.avatar_url as sender_avatar_url
      FROM messages m
      JOIN users sender ON m.sender_id = sender.user_id
      WHERE ((m.sender_id = ? AND m.recipient_id = ?) 
             OR (m.sender_id = ? AND m.recipient_id = ?))
        AND m.content LIKE ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `

    const searchPattern = `%${searchTerm}%`
    db.all(
      sql,
      [userId1, userId2, userId2, userId1, searchPattern, limit],
      (err, rows) => {
        if (err) {
          reject(err)
        } else {
          const messages = (rows || []).map((row) => ({
            message_id: row.message_id,
            sender_id: row.sender_id,
            recipient_id: row.recipient_id,
            content: row.content,
            message_type: row.message_type,
            is_read: Boolean(row.is_read),
            created_at: row.created_at,
            sender: {
              username: row.sender_username,
              avatar_url: row.sender_avatar_url,
            },
          }))
          resolve(messages.reverse()) // Return in chronological order
        }
      }
    )
  })
}
