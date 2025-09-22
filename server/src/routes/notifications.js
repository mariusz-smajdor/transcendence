import {
  addConnection,
  removeConnection,
} from '../services/notificationService.js';

async function notificationRoutes(fastify) {
  // WebSocket route for notifications
  fastify.get('/notifications', { websocket: true }, (connection, req) => {
    console.log('WebSocket connection attempt received');
    console.log('Connection object keys:', Object.keys(connection));
    console.log('Connection.socket:', connection.socket);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);

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

    console.log('Token found:', !!token);
    console.log(
      'Token value:',
      token ? token.substring(0, 20) + '...' : 'none',
    );

    if (!token) {
      console.log('No token provided, closing connection');
      connection.close(1008, 'No token provided');
      return;
    }

    try {
      const decoded = fastify.jwt.verify(token);
      const userId = decoded.userId;

      console.log(`WebSocket authentication successful for user ${userId}`);

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

      console.log('Welcome message sent to user', userId);
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      connection.close(1008, 'Invalid token');
    }
  });
}

export default notificationRoutes;
