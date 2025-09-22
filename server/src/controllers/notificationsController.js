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
    connection.close(1008, 'Invalid token');
  }
};
