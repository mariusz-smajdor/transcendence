import {
  sendNotification,
  createUserBlockedNotification,
} from './notificationService.js';

export async function blockUser(db, blockerId, blockedId) {
  try {
    // Check if user is blocking themselves
    if (blockerId === blockedId) {
      return {
        success: false,
        message: 'Cannot block yourself',
      };
    }

    // Check if already blocked
    const existingBlock = db
      .prepare(
        'SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
      )
      .get(blockerId, blockedId);

    if (existingBlock) {
      return {
        success: false,
        message: 'User is already blocked',
      };
    }

    // Get blocker username for notification
    const blocker = db
      .prepare('SELECT username FROM users WHERE id = ?')
      .get(blockerId);

    // Insert block record
    db.prepare(
      'INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)',
    ).run(blockerId, blockedId);

    // Remove friendship if exists (both directions)
    db.prepare(
      'DELETE FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)',
    ).run(blockerId, blockedId, blockedId, blockerId);

    // Remove any pending friend requests (both directions)
    db.prepare(
      'DELETE FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
    ).run(blockerId, blockedId, blockedId, blockerId);

    // Send notification to blocked user to refresh their friends list
    const notification = createUserBlockedNotification(
      blocker.username,
      blockedId,
    );
    sendNotification(blockedId, notification);

    return {
      success: true,
      message: 'User blocked successfully',
    };
  } catch (error) {
    console.error('Error blocking user:', error);
    return {
      success: false,
      message: 'Failed to block user',
    };
  }
}

export async function unblockUser(db, blockerId, blockedId) {
  try {
    // Delete block record
    const result = db
      .prepare(
        'DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
      )
      .run(blockerId, blockedId);

    if (result.changes === 0) {
      return {
        success: false,
        message: 'User is not blocked',
      };
    }

    return {
      success: true,
      message: 'User unblocked successfully',
    };
  } catch (error) {
    console.error('Error unblocking user:', error);
    return {
      success: false,
      message: 'Failed to unblock user',
    };
  }
}

export async function isBlocked(db, blockerId, blockedId) {
  try {
    const block = db
      .prepare(
        'SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
      )
      .get(blockerId, blockedId);

    return !!block;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
}

export async function getBlockedUsers(db, userId) {
  try {
    const blockedUsers = db
      .prepare(
        `
        SELECT u.id, u.username, u.avatar
        FROM blocked_users bu
        JOIN users u ON bu.blocked_id = u.id
        WHERE bu.blocker_id = ?
        ORDER BY bu.blocked_at DESC
      `,
      )
      .all(userId);

    return {
      success: true,
      blockedUsers,
    };
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return {
      success: false,
      message: 'Failed to fetch blocked users',
      blockedUsers: [],
    };
  }
}

export async function isBlockedByEither(db, userId1, userId2) {
  try {
    const block = db
      .prepare(
        `SELECT * FROM blocked_users 
         WHERE (blocker_id = ? AND blocked_id = ?) 
         OR (blocker_id = ? AND blocked_id = ?)`,
      )
      .get(userId1, userId2, userId2, userId1);

    return !!block;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
}
