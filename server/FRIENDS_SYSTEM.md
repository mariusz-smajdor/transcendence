# Friends System with WebSocket Support

A complete friends list and friend requests system with real-time WebSocket notifications.

## Features

- Send/receive friend requests
- Accept/decline friend requests
- Remove friends
- Real-time notifications via WebSocket
- Online status tracking
- User search functionality
- Dashboard with complete friends overview

## Database Schema

### Friendships Table

```sql
CREATE TABLE friendships (
    friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    addressee_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(requester_id, addressee_id)
);
```

## API Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Friends Management

- `GET /api/friends/` - Get user's friends list
- `DELETE /api/friends/:friend_id` - Remove a friend

### Friend Requests

- `POST /api/friends/request` - Send friend request
- `GET /api/friends/requests/pending` - Get received friend requests
- `GET /api/friends/requests/sent` - Get sent friend requests
- `PUT /api/friends/requests/:friendship_id/accept` - Accept friend request
- `DELETE /api/friends/requests/:friendship_id/decline` - Decline friend request

### Utilities

- `GET /api/friends/dashboard` - Get complete friends overview
- `GET /api/friends/search?q=username` - Search users
- `GET /api/friends/status/:user_id` - Check friendship status with user
- `GET /api/friends/ws/stats` - WebSocket connection statistics

### WebSocket Connection

- `WS /api/friends/ws?token=<jwt_token>` - Real-time notifications

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

### Friend Request Events

```javascript
// Friend request received
{
  "type": "friend_request_received",
  "data": {
    "friendship_id": 456,
    "requester": {
      "user_id": 789,
      "username": "john_doe",
      "avatar_url": "https://..."
    },
    "created_at": "2023-01-01T12:00:00.000Z"
  }
}

// Friend request accepted
{
  "type": "friend_request_accepted",
  "data": {
    "friendship_id": 456,
    "friend": {
      "user_id": 123,
      "username": "jane_doe",
      "avatar_url": "https://..."
    },
    "accepted_at": "2023-01-01T12:00:00.000Z"
  }
}

// Friend request declined
{
  "type": "friend_request_declined",
  "data": {
    "friendship_id": 456,
    "declined_by": {
      "user_id": 123,
      "username": "jane_doe",
      "avatar_url": "https://..."
    },
    "declined_at": "2023-01-01T12:00:00.000Z"
  }
}
```

### Friendship Events

```javascript
// Friend removed
{
  "type": "friend_removed",
  "data": {
    "removed_by": {
      "user_id": 123,
      "username": "jane_doe",
      "avatar_url": "https://..."
    },
    "removed_at": "2023-01-01T12:00:00.000Z"
  }
}

// Friends list update
{
  "type": "friends_list_update",
  "data": {
    "friends": [
      {
        "friend_id": 789,
        "username": "john_doe",
        "avatar_url": "https://...",
        "friendship_date": "2023-01-01T12:00:00.000Z",
        "is_online": true
      }
    ]
  }
}
```

### Online Status Events

```javascript
// User came online
{
  "type": "user_online",
  "data": {
    "user": {
      "user_id": 789,
      "username": "john_doe",
      "avatar_url": "https://..."
    },
    "timestamp": "2023-01-01T12:00:00.000Z"
  }
}

// User went offline
{
  "type": "user_offline",
  "data": {
    "user": {
      "user_id": 789,
      "username": "john_doe",
      "avatar_url": "https://..."
    },
    "timestamp": "2023-01-01T12:00:00.000Z"
  }
}
```

## Usage Examples

### Frontend WebSocket Connection

```javascript
// Connect to WebSocket
const token = localStorage.getItem('jwt_token')
const ws = new WebSocket(`ws://localhost:3000/api/friends/ws?token=${token}`)

ws.onopen = () => {
  console.log('Connected to friends WebSocket')

  // Send periodic ping to keep connection alive
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping' }))
  }, 30000)
}

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)

  switch (message.type) {
    case 'friend_request_received':
      showNotification(
        `New friend request from ${message.data.requester.username}`
      )
      updatePendingRequestsCount()
      break

    case 'friend_request_accepted':
      showNotification(
        `${message.data.friend.username} accepted your friend request!`
      )
      refreshFriendsList()
      break

    case 'friends_list_update':
      updateFriendsList(message.data.friends)
      break

    case 'user_online':
      updateUserOnlineStatus(message.data.user.user_id, true)
      break

    case 'user_offline':
      updateUserOnlineStatus(message.data.user.user_id, false)
      break
  }
}
```

### API Usage Examples

```javascript
// Send friend request
const response = await fetch('/api/friends/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ username: 'john_doe' }),
})

// Get dashboard data on app launch
const dashboard = await fetch('/api/friends/dashboard', {
  headers: { Authorization: `Bearer ${token}` },
})
const data = await dashboard.json()

// data.friends.list - friends array
// data.pending_requests.list - pending requests
// data.sent_requests.list - sent requests

// Accept friend request
await fetch(`/api/friends/requests/${friendshipId}/accept`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token}` },
})

// Search users
const searchResults = await fetch(`/api/friends/search?q=john`, {
  headers: { Authorization: `Bearer ${token}` },
})
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
- `404` - Resource not found (user, friendship, etc.)
- `409` - Conflict (duplicate friend request, already friends)
- `500` - Server error

## Security Features

- JWT authentication required for all endpoints
- WebSocket connections authenticated via query parameter
- User can only modify their own friendships
- Input validation and sanitization
- SQL injection protection via parameterized queries

## Performance Considerations

- Database indexes on frequently queried fields
- Connection pooling for WebSocket management
- Efficient queries with JOIN operations
- Pagination support for large friend lists (limit parameter)
- Automatic cleanup of closed WebSocket connections

## Installation & Setup

1. Install dependencies: `npm install`
2. Database will auto-initialize with the friendships table
3. Start server: `npm run dev`
4. WebSocket endpoint available at `ws://localhost:3000/api/friends/ws`

The system is now ready for real-time friends management!
