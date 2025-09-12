# Private Messaging System

A complete private messaging system between friends with real-time WebSocket notifications.

## Features

- Send/receive private messages between friends
- Real-time message delivery via WebSocket
- Message read status tracking
- Message deletion (sender only)
- Conversation history with pagination
- Message search within conversations
- Unread message count
- Message types support (text, image, file)

## Database Schema

### Messages Table

```sql
CREATE TABLE messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text', -- 'text', 'image', 'file'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

## API Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Message Management

- `POST /api/messages/send` - Send a message to a friend
- `GET /api/messages/conversation/:user_id` - Get conversation with a specific user
- `GET /api/messages/conversations` - Get all conversations for the user
- `PUT /api/messages/read/:user_id` - Mark messages as read from a specific user
- `GET /api/messages/unread-count` - Get total unread message count
- `DELETE /api/messages/:message_id` - Delete a message (sender only)
- `GET /api/messages/search/:user_id` - Search messages in a conversation

### WebSocket Connection

- `WS /api/friends/ws?token=<jwt_token>` - Real-time notifications (shared with friends system)

## API Usage Examples

### Send a Message

```javascript
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    recipient_id: 123,
    content: 'Hello! How are you?',
    message_type: 'text', // optional, defaults to 'text'
  }),
})

const data = await response.json()
// Returns: { success: true, message: { message_id, sender_id, recipient_id, content, ... } }
```

### Get Conversation

```javascript
const response = await fetch(
  '/api/messages/conversation/123?limit=50&offset=0',
  {
    headers: { Authorization: `Bearer ${token}` },
  }
)

const data = await response.json()
// Returns: { success: true, messages: [...], count: 25, conversation_with: {...} }
```

### Get All Conversations

```javascript
const response = await fetch('/api/messages/conversations', {
  headers: { Authorization: `Bearer ${token}` },
})

const data = await response.json()
// Returns: { success: true, conversations: [...], count: 5 }
```

### Mark Messages as Read

```javascript
const response = await fetch('/api/messages/read/123', {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` },
})

const data = await response.json()
// Returns: { success: true, updated_count: 3 }
```

### Get Unread Count

```javascript
const response = await fetch('/api/messages/unread-count', {
  headers: { Authorization: `Bearer ${token}` },
})

const data = await response.json()
// Returns: { success: true, unread_count: 5 }
```

### Delete a Message

```javascript
const response = await fetch('/api/messages/456', {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
})

const data = await response.json()
// Returns: { success: true, message: 'Message deleted successfully' }
```

### Search Messages

```javascript
const response = await fetch('/api/messages/search/123?q=hello&limit=20', {
  headers: { Authorization: `Bearer ${token}` },
})

const data = await response.json()
// Returns: { success: true, messages: [...], count: 3, search_term: 'hello' }
```

## WebSocket Messages

### Connection Events

```javascript
// Connection established
{
  "type": "connection_established",
  "data": {
    "user_id": 123,
    "timestamp": "2023-01-01T12:00:00.000Z"
  }
}

// Ping/Pong for health check
// Send: { "type": "ping" }
// Receive: { "type": "pong", "timestamp": "..." }
```

### Message Events

```javascript
// New message received
{
  "type": "new_message",
  "data": {
    "message": {
      "message_id": 789,
      "sender_id": 123,
      "recipient_id": 456,
      "content": "Hello there!",
      "message_type": "text",
      "is_read": false,
      "created_at": "2023-01-01T12:00:00.000Z",
      "sender": {
        "user_id": 123,
        "username": "john_doe",
        "avatar_url": "https://..."
      }
    }
  }
}

// Messages marked as read
{
  "type": "message_read",
  "data": {
    "read_by": 456,
    "read_at": "2023-01-01T12:05:00.000Z",
    "updated_count": 3
  }
}

// Message deleted
{
  "type": "message_deleted",
  "data": {
    "message_id": 789,
    "deleted_by": 123,
    "deleted_at": "2023-01-01T12:10:00.000Z"
  }
}
```

## Frontend WebSocket Integration

```javascript
// Connect to WebSocket
const token = localStorage.getItem('jwt_token')
const ws = new WebSocket(`ws://localhost:3000/api/friends/ws?token=${token}`)

ws.onopen = () => {
  console.log('Connected to messaging WebSocket')

  // Send periodic ping to keep connection alive
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping' }))
  }, 30000)
}

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)

  switch (message.type) {
    case 'new_message':
      displayNewMessage(message.data.message)
      updateUnreadCount()
      playNotificationSound()
      break

    case 'message_read':
      updateMessageReadStatus(message.data)
      break

    case 'message_deleted':
      removeMessageFromUI(message.data.message_id)
      break

    case 'connection_established':
      console.log('WebSocket connection established')
      break

    case 'pong':
      // Connection is alive
      break
  }
}

ws.onclose = () => {
  console.log('WebSocket connection closed')
  // Implement reconnection logic
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
}
```

## Response Format

All API responses follow this format:

### Success Response

```javascript
{
  "success": true,
  "message": "Operation successful",
  // Additional data fields...
}
```

### Error Response

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information", // optional
  "statusCode": 400 // optional
}
```

## Error Handling

- `400` - Validation errors, invalid input
- `401` - Authentication required
- `403` - Can only send messages to friends
- `404` - Resource not found (user, message, etc.)
- `500` - Server error

## Security Features

- JWT authentication required for all endpoints
- WebSocket connections authenticated via query parameter
- Users can only send messages to friends
- Users can only delete their own messages
- Input validation and sanitization
- SQL injection protection via parameterized queries

## Performance Considerations

- Database indexes on frequently queried fields
- Pagination support for conversation history
- Efficient queries with JOIN operations
- Connection pooling for WebSocket management
- Automatic cleanup of closed WebSocket connections

## Message Types

Currently supported message types:

- `text` - Plain text messages (default)
- `image` - Image messages (for future file upload implementation)
- `file` - File messages (for future file upload implementation)

## Integration with Friends System

The messaging system is fully integrated with the existing friends system:

- Messages can only be sent between accepted friends
- Uses the same WebSocket connection as the friends system
- Shares the same authentication and user management
- Online status affects message delivery notifications

## Installation & Setup

1. The messaging system is automatically initialized with the server
2. Database tables are created on first run
3. WebSocket endpoint available at `ws://localhost:3000/api/friends/ws`
4. All message endpoints available under `/api/messages/`

The messaging system is now ready for real-time private communication between friends!
