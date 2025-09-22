// Notification types - easily extensible
export const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
  FRIEND_REQUEST_REJECTED: 'friend_request_rejected',
  FRIEND_REMOVED: 'friend_removed',
  MESSAGE: 'message',
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
