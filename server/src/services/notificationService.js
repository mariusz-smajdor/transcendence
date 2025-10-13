// Notification types - easily extensible
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
  FRIEND_REQUEST_REJECTED: 'friend_request_rejected',
  FRIEND_REMOVED: 'friend_removed',
  USER_BLOCKED: 'user_blocked',
  MESSAGE: 'message',
  FRIEND_ONLINE: 'friend_online',
  FRIEND_OFFLINE: 'friend_offline',
  // Future notification types can be added here
  // GAME_INVITATION: 'game_invitation',
};

// Store active WebSocket connections by user ID
const activeConnections = new Map();

export const addConnection = (userId, ws) => {
  activeConnections.set(userId, ws);
  console.log(
    `User ${userId} connected. Total connections: ${activeConnections.size}`,
  );
};

export const removeConnection = (userId) => {
  activeConnections.delete(userId);
  console.log(
    `User ${userId} disconnected. Total connections: ${activeConnections.size}`,
  );
};

export const sendNotification = (userId, notification) => {
  const connection = activeConnections.get(userId);

  if (connection && connection.readyState === 1) {
    // WebSocket.OPEN
    try {
      connection.send(JSON.stringify(notification));
      console.log(`Notification sent to user ${userId}:`, notification.type);
      return true;
    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error);
      removeConnection(userId);
      return false;
    }
  } else {
    console.log(`User ${userId} is not connected`);
    return false;
  }
};

// Helper functions for friend request notifications
export const createFriendRequestNotification = (senderUsername, receiverId) => {
  return {
    type: NOTIFICATION_TYPES.FRIEND_REQUEST,
    data: {
      senderUsername,
      timestamp: Date.now(),
    },
    message: `${senderUsername} sent you a friend request`,
  };
};

export const createFriendRequestAcceptedNotification = (
  accepterUsername,
  senderId,
) => {
  return {
    type: NOTIFICATION_TYPES.FRIEND_REQUEST_ACCEPTED,
    data: {
      accepterUsername,
      timestamp: Date.now(),
    },
    message: `${accepterUsername} accepted your friend request`,
  };
};

export const createFriendRequestRejectedNotification = (
  rejecterUsername,
  senderId,
) => {
  return {
    type: NOTIFICATION_TYPES.FRIEND_REQUEST_REJECTED,
    data: {
      rejecterUsername,
      timestamp: Date.now(),
    },
    message: `${rejecterUsername} rejected your friend request`,
  };
};

export const createFriendRemovedNotification = (
  removerUsername,
  removedUserId,
) => {
  return {
    type: NOTIFICATION_TYPES.FRIEND_REMOVED,
    data: {
      removerUsername,
      timestamp: Date.now(),
    },
    message: `${removerUsername} removed you from their friends list`,
  };
};

export const createUserBlockedNotification = (
  blockerUsername,
  blockedUserId,
) => {
  return {
    type: NOTIFICATION_TYPES.USER_BLOCKED,
    data: {
      blockerUsername,
      timestamp: Date.now(),
    },
    message: `${blockerUsername} blocked you`,
  };
};

export const createMessageNotification = (
  senderUsername,
  message,
  receiverId,
  senderId,
) => {
  return {
    type: NOTIFICATION_TYPES.MESSAGE,
    data: {
      senderUsername,
      senderId,
      message: message.length > 50 ? message.substring(0, 50) + '...' : message,
      timestamp: Date.now(),
    },
    message: `New message from ${senderUsername}`,
  };
};

export const createFriendOnlineNotification = (friendId, friendUsername) => {
  return {
    type: NOTIFICATION_TYPES.FRIEND_ONLINE,
    data: {
      friendId,
      friendUsername,
      timestamp: Date.now(),
    },
    message: `${friendUsername} is now online`,
  };
};

export const createFriendOfflineNotification = (friendId, friendUsername) => {
  return {
    type: NOTIFICATION_TYPES.FRIEND_OFFLINE,
    data: {
      friendId,
      friendUsername,
      timestamp: Date.now(),
    },
    message: `${friendUsername} is now offline`,
  };
};

export const notifyFriendsOfStatus = async (userId, isOnline, db) => {
  try {
    // Get user's friends - using the friends table structure
    const friendsQuery = `
      SELECT u.id, u.username
      FROM users u
      INNER JOIN friends f ON (
        (f.user_id_1 = ? AND f.user_id_2 = u.id) OR
        (f.user_id_2 = ? AND f.user_id_1 = u.id)
      )
      WHERE u.id != ?
    `;

    const friends = db.prepare(friendsQuery).all(userId, userId, userId);

    // Get the username of the user who changed status
    const user = db
      .prepare('SELECT username FROM users WHERE id = ?')
      .get(userId);

    if (!user) return;

    // Notify each friend
    for (const friend of friends) {
      const notification = isOnline
        ? createFriendOnlineNotification(userId, user.username)
        : createFriendOfflineNotification(userId, user.username);

      sendNotification(friend.id, notification);
    }
  } catch (error) {
    console.error('Error notifying friends of status change:', error);
  }
};

export const getOnlineFriends = async (userId, db) => {
  try {
    // Get user's friends - using the friends table structure
    const friendsQuery = `
      SELECT u.id, u.username
      FROM users u
      INNER JOIN friends f ON (
        (f.user_id_1 = ? AND f.user_id_2 = u.id) OR
        (f.user_id_2 = ? AND f.user_id_1 = u.id)
      )
      WHERE u.id != ?
    `;

    const friends = db.prepare(friendsQuery).all(userId, userId, userId);

    // Filter to only return friends who are online
    const onlineFriends = friends.filter((friend) =>
      activeConnections.has(friend.id),
    );

    return onlineFriends.map((friend) => friend.id);
  } catch (error) {
    console.error('Error getting online friends:', error);
    return [];
  }
};
