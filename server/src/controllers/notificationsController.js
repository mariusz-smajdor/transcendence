import {
  addConnection,
  removeConnection,
} from '../services/notificationService.js';

export const notificationsWebSocketHandler = async (
  connection,
  req,
  fastify,
) => {
  // Extract user ID from JWT token
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  // Try query parameter (for WebSocket connections)
  if (!token && req.query?.token) {
    token = req.query.token;
  }

  // Try cookies as fallback
  if (!token && req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    console.log('No token provided, closing connection');
    connection.close(1008, 'No token provided');
    return;
  }

  try {
    const decoded = fastify.jwt.verify(token);
    const userId = decoded.userId;

    // Add connection to active connections
    addConnection(userId, connection);

    // Handle connection close
    connection.on('close', (code, reason) => {
      console.log(
        `WebSocket closed for user ${userId}. Code: ${code}, Reason: ${reason}`,
      );
      removeConnection(userId);
    });

    // Handle connection errors
    connection.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
      removeConnection(userId);
    });

    // Send welcome message
    connection.send(
      JSON.stringify({
        type: 'connection_established',
        message: 'Connected to notifications',
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    console.error('WebSocket authentication error:', error);

    // Check if the error is specifically about token expiration
    if (error.code === 'FAST_JWT_EXPIRED') {
      console.log('Token expired, sending refresh request to client');
      connection.send(
        JSON.stringify({
          type: 'token_expired',
          message: 'Your session has expired. Please refresh your token.',
          timestamp: Date.now(),
        }),
      );
      // Give client a moment to handle the message before closing
      setTimeout(() => {
        connection.close(1008, 'Token expired');
      }, 1000);
    } else {
      connection.close(1008, 'Invalid token');
    }
  }
};
