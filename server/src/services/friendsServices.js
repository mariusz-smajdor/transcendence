import {
  sendNotification,
  createFriendRequestNotification,
  createFriendRequestAcceptedNotification,
  createFriendRequestRejectedNotification,
  createFriendRemovedNotification,
} from './notificationService.js';
import { isBlockedByEither } from './blockingService.js';

export const getFriendsList = async (db, userId) => {
  try {
    const friendsQuery = `
      SELECT u.id, u.username, u.email, u.avatar
      FROM users u
      INNER JOIN friends f ON (
        (f.user_id_1 = ? AND f.user_id_2 = u.id) OR
        (f.user_id_2 = ? AND f.user_id_1 = u.id)
      )
      WHERE u.id != ?
    `;

    const friends = db.prepare(friendsQuery).all(userId, userId, userId);
    return { success: true, friends };
  } catch (error) {
    console.error('Error fetching friends list:', error);
    return { success: false, message: 'Failed to fetch friends list' };
  }
};

export const sendFriendRequest = async (db, senderId, receiverUsername) => {
  try {
    // First, find the receiver by username
    const receiver = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(receiverUsername);

    if (!receiver) {
      return { success: false, message: 'User not found' };
    }

    const receiverId = receiver.id;

    // Check if trying to add yourself
    if (senderId === receiverId) {
      return {
        success: false,
        message: 'Cannot send friend request to yourself',
      };
    }

    // Check if users have blocked each other
    const blocked = await isBlockedByEither(db, senderId, receiverId);
    if (blocked) {
      return {
        success: false,
        message: 'Cannot send friend request to this user',
      };
    }

    // Check if users are already friends
    const existingFriendship = db
      .prepare(
        `
      SELECT id FROM friends 
      WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)
    `,
      )
      .get(senderId, receiverId, receiverId, senderId);

    if (existingFriendship) {
      return { success: false, message: 'Users are already friends' };
    }

    // Check if there's already a pending request
    const existingRequest = db
      .prepare(
        `
      SELECT id FROM friend_requests 
      WHERE sender_id = ? AND receiver_id = ?
    `,
      )
      .get(senderId, receiverId);

    if (existingRequest) {
      return { success: false, message: 'Friend request already sent' };
    }

    // Check if there's a reverse request
    const reverseRequest = db
      .prepare(
        `
      SELECT id FROM friend_requests 
      WHERE sender_id = ? AND receiver_id = ?
    `,
      )
      .get(receiverId, senderId);

    if (reverseRequest) {
      return {
        success: false,
        message: 'There is already a pending friend request from this user',
      };
    }

    // Insert friend request
    const stmt = db.prepare(`
      INSERT INTO friend_requests (sender_id, receiver_id) 
      VALUES (?, ?)
    `);

    const result = stmt.run(senderId, receiverId);

    if (result.changes > 0) {
      // Get sender username for notification
      const sender = db
        .prepare('SELECT username FROM users WHERE id = ?')
        .get(senderId);

      // Send notification to receiver
      const notification = createFriendRequestNotification(
        sender.username,
        receiverId,
      );
      sendNotification(receiverId, notification);

      return { success: true, message: 'Friend request sent successfully' };
    } else {
      return { success: false, message: 'Failed to send friend request' };
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, message: 'Failed to send friend request' };
  }
};

export const getFriendRequests = async (db, userId) => {
  try {
    const requestsQuery = `
      SELECT fr.id, fr.sender_id, u.username, u.email, u.avatar
      FROM friend_requests fr
      INNER JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ?
    `;

    const requests = db.prepare(requestsQuery).all(userId);
    return { success: true, requests };
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return { success: false, message: 'Failed to fetch friend requests' };
  }
};

export const acceptFriendRequest = async (db, requestId, userId) => {
  try {
    // Get the request details
    const request = db
      .prepare(
        `
      SELECT sender_id, receiver_id FROM friend_requests 
      WHERE id = ? AND receiver_id = ?
    `,
      )
      .get(requestId, userId);

    if (!request) {
      return {
        success: false,
        message: 'Friend request not found or unauthorized',
      };
    }

    // Start transaction
    const transaction = db.transaction(() => {
      // Add to friends table
      const addFriendStmt = db.prepare(`
        INSERT INTO friends (user_id_1, user_id_2) 
        VALUES (?, ?)
      `);
      addFriendStmt.run(request.sender_id, request.receiver_id);

      // Remove from friend_requests table
      const removeRequestStmt = db.prepare(`
        DELETE FROM friend_requests 
        WHERE id = ?
      `);
      removeRequestStmt.run(requestId);
    });

    transaction();

    // Get accepter username for notification
    const accepter = db
      .prepare('SELECT username FROM users WHERE id = ?')
      .get(userId);

    // Send notification to original sender (not to the accepter)
    const senderNotification = createFriendRequestAcceptedNotification(
      accepter.username,
      request.sender_id,
    );
    sendNotification(request.sender_id, senderNotification);

    return { success: true, message: 'Friend request accepted successfully' };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, message: 'Failed to accept friend request' };
  }
};

export const rejectFriendRequest = async (db, requestId, userId) => {
  try {
    // First get the request details to find the sender
    const request = db
      .prepare(
        `
      SELECT sender_id FROM friend_requests 
      WHERE id = ? AND receiver_id = ?
    `,
      )
      .get(requestId, userId);

    if (!request) {
      return {
        success: false,
        message: 'Friend request not found or unauthorized',
      };
    }

    const stmt = db.prepare(`
      DELETE FROM friend_requests 
      WHERE id = ? AND receiver_id = ?
    `);

    const result = stmt.run(requestId, userId);

    if (result.changes > 0) {
      // Get rejecter username for notification
      const rejecter = db
        .prepare('SELECT username FROM users WHERE id = ?')
        .get(userId);

      // Send notification to original sender
      const notification = createFriendRequestRejectedNotification(
        rejecter.username,
        request.sender_id,
      );
      sendNotification(request.sender_id, notification);

      return { success: true, message: 'Friend request rejected successfully' };
    } else {
      return {
        success: false,
        message: 'Friend request not found or unauthorized',
      };
    }
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return { success: false, message: 'Failed to reject friend request' };
  }
};

export const removeFriend = async (db, userId, friendId) => {
  try {
    const stmt = db.prepare(`
      DELETE FROM friends 
      WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)
    `);

    const result = stmt.run(userId, friendId, friendId, userId);

    if (result.changes > 0) {
      // Get usernames for notifications
      const remover = db
        .prepare('SELECT username FROM users WHERE id = ?')
        .get(userId);
      const removed = db
        .prepare('SELECT username FROM users WHERE id = ?')
        .get(friendId);

      // Send notification to the removed user (not to the remover)
      const removedNotification = createFriendRemovedNotification(
        remover.username,
        friendId,
      );
      sendNotification(friendId, removedNotification);

      return { success: true, message: 'Friend removed successfully' };
    } else {
      return { success: false, message: 'Friendship not found' };
    }
  } catch (error) {
    console.error('Error removing friend:', error);
    return { success: false, message: 'Failed to remove friend' };
  }
};
