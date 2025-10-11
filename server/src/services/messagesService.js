import {
  sendNotification,
  createMessageNotification,
} from './notificationService.js';

export const sendMessage = async (db, senderId, receiverId, message) => {
  try {
    // Insert message into database
    const stmt = db.prepare(`
      INSERT INTO messages (sender, receiver, message) 
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(senderId, receiverId, message);

    if (result.changes > 0) {
      // Get sender info for notification
      const sender = db
        .prepare('SELECT username FROM users WHERE id = ?')
        .get(senderId);

      // Send notification to receiver
      const notification = createMessageNotification(
        sender.username,
        message,
        receiverId,
        senderId,
      );
      sendNotification(receiverId, notification);

      return {
        success: true,
        message: 'Message sent successfully',
        messageId: result.lastInsertRowid,
      };
    } else {
      return { success: false, message: 'Failed to send message' };
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, message: 'Failed to send message' };
  }
};

export const getMessages = async (db, userId, otherUserId) => {
  try {
    const messagesQuery = `
      SELECT m.id, m.sender, m.receiver, m.message, m.created_at, m.read, u.username as sender_username
      FROM messages m
      INNER JOIN users u ON m.sender = u.id
      WHERE (m.sender = ? AND m.receiver = ?) OR (m.sender = ? AND m.receiver = ?)
      ORDER BY m.created_at ASC
    `;

    const messages = db
      .prepare(messagesQuery)
      .all(userId, otherUserId, otherUserId, userId);
    return { success: true, messages };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, message: 'Failed to fetch messages' };
  }
};

export const getConversations = async (db, userId) => {
  try {
    const conversationsQuery = `
      SELECT 
        other_user.id as user_id,
        other_user.username,
        other_user.avatar,
        last_message.message as last_message,
        last_message.created_at as last_message_time,
        unread_count.count as unread_count
      FROM (
        SELECT DISTINCT 
          CASE 
            WHEN sender = ? THEN receiver 
            ELSE sender 
          END as other_user_id
        FROM messages 
        WHERE sender = ? OR receiver = ?
      ) conversations
      INNER JOIN users other_user ON conversations.other_user_id = other_user.id
      LEFT JOIN (
        SELECT 
          CASE 
            WHEN sender = ? THEN receiver 
            ELSE sender 
          END as other_user_id,
          message,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY CASE WHEN sender = ? THEN receiver ELSE sender END 
            ORDER BY created_at DESC
          ) as rn
        FROM messages 
        WHERE sender = ? OR receiver = ?
      ) last_message ON conversations.other_user_id = last_message.other_user_id AND last_message.rn = 1
      LEFT JOIN (
        SELECT 
          CASE 
            WHEN sender = ? THEN receiver 
            ELSE sender 
          END as other_user_id,
          COUNT(*) as count
        FROM messages 
        WHERE receiver = ? AND sender != ? AND read = FALSE
        GROUP BY other_user_id
      ) unread_count ON conversations.other_user_id = unread_count.other_user_id
      ORDER BY last_message_time DESC
    `;

    const conversations = db.prepare(conversationsQuery).all(
      userId,
      userId,
      userId, // for conversations
      userId,
      userId,
      userId,
      userId, // for last message
      userId,
      userId,
      userId, // for unread count
    );

    return { success: true, conversations };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, message: 'Failed to fetch conversations' };
  }
};

export const markMessagesAsRead = async (db, userId, otherUserId) => {
  try {
    const stmt = db.prepare(`
      UPDATE messages 
      SET read = TRUE 
      WHERE sender = ? AND receiver = ? AND read = FALSE
    `);

    const result = stmt.run(otherUserId, userId);

    return {
      success: true,
      message: 'Messages marked as read',
      updatedCount: result.changes,
    };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, message: 'Failed to mark messages as read' };
  }
};
