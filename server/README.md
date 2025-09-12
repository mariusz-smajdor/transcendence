# Transcendence Backend

A Node.js backend API built with Fastify for the Transcendence project, featuring user authentication, OAuth integration, a real-time friends system, and private messaging with WebSocket support.

## 🚀 Features

- **User Management**: Registration, login, logout, and profile management
- **OAuth Integration**: Google OAuth2 authentication
- **Friends System**: Complete friends management with real-time notifications
- **Private Messaging**: Real-time messaging between friends
- **WebSocket Support**: Real-time communication for friends and messaging
- **Cookie-Based Authentication**: Secure HTTP-only cookies with JWT fallback
- **SQLite Database**: Lightweight database with automatic schema initialization
- **Input Validation**: Comprehensive validation for all endpoints
- **Error Handling**: Structured error responses and logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google OAuth2 credentials (for OAuth features)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd transc_back
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback
   ```

4. **Start the server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app.js                 # Main application setup
├── config/
│   └── oauthConfig.js     # OAuth configuration
├── controllers/           # Request handlers
│   ├── friendsController.js
│   ├── healthController.js
│   ├── messageController.js
│   ├── oauthController.js
│   └── userController.js
├── database/
│   ├── init.js           # Database initialization
│   ├── schema.sql        # Database schema
│   └── database.sqlite   # SQLite database file
├── middleware/
│   └── authMiddleware.js  # JWT authentication middleware
├── routes/               # API route definitions
│   ├── friends.js
│   ├── health.js
│   ├── messages.js
│   ├── oauth.js
│   └── users.js
├── services/             # Business logic
│   ├── authService.js
│   ├── friendsService.js
│   ├── googleProfileService.js
│   ├── messageService.js
│   ├── oauthService.js
│   ├── userService.js
│   ├── websocketHandler.js
│   └── websocketService.js
└── utils/                # Utility functions
    ├── friendsValidation.js
    ├── messageValidation.js
    ├── oauthValidation.js
    ├── responseHelpers.js
    └── userValidation.js
```

## 🔌 API Endpoints

### Health Check

- `GET /api/health` - Server health status

**Response:**

```json
{
  "status": "OK"
}
```

### User Management

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login (sets authentication cookie)
- `POST /api/users/logout` - User logout (clears authentication cookie)
- `GET /api/users/me` - Get current user info (requires auth)

#### Register User

```http
POST /api/users/register
Content-Type: application/json

{
  "username": "alice",
  "password": "password123",
  "avatar_url": "https://example.com/alice.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "user_id": 1,
  "username": "alice"
}
```

#### Login User

```http
POST /api/users/login
Content-Type: application/json

{
  "username": "alice",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "user_id": 1,
    "username": "alice",
    "avatar_url": "https://example.com/alice.jpg",
    "email": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout User

```http
POST /api/users/logout
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User

```http
GET /api/users/me
```

**Response:**

```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "user_id": 1,
  "username": "alice",
  "avatar_url": "https://example.com/alice.jpg",
  "email": null
}
```

### OAuth

- `GET /api/oauth/google` - Initiate Google OAuth
- `GET /api/oauth/google/callback` - Google OAuth callback

### Friends System

- `GET /api/friends/dashboard` - Get complete friends overview
- `GET /api/friends/` - Get user's friends list
- `DELETE /api/friends/:friend_id` - Remove a friend
- `POST /api/friends/request` - Send friend request
- `GET /api/friends/requests/pending` - Get received friend requests
- `GET /api/friends/requests/sent` - Get sent friend requests
- `PUT /api/friends/requests/:friendship_id/accept` - Accept friend request
- `DELETE /api/friends/requests/:friendship_id/decline` - Decline friend request
- `GET /api/friends/search?q=username` - Search users
- `GET /api/friends/status/:user_id` - Check friendship status
- `GET /api/friends/ws/stats` - WebSocket connection statistics

#### Send Friend Request

```http
POST /api/friends/request
Content-Type: application/json

{
  "username": "bob"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Friend request sent successfully",
  "friendship_id": 1,
  "target_user": {
    "user_id": 2,
    "username": "bob",
    "avatar_url": "https://example.com/bob.jpg"
  }
}
```

#### Get Friends List

```http
GET /api/friends/
```

**Response:**

```json
{
  "success": true,
  "message": "Friends retrieved successfully",
  "friends": [
    {
      "friendship_id": 1,
      "friend_id": 2,
      "username": "bob",
      "avatar_url": "https://example.com/bob.jpg",
      "friendship_date": "2023-01-01T12:00:00.000Z",
      "is_online": true
    }
  ],
  "count": 1
}
```

### Private Messaging

- `POST /api/messages/send` - Send a message to a friend
- `GET /api/messages/conversation/:user_id` - Get conversation with a specific user
- `GET /api/messages/conversations` - Get all conversations for the user
- `PUT /api/messages/read/:user_id` - Mark messages as read from a specific user
- `GET /api/messages/unread-count` - Get total unread message count
- `DELETE /api/messages/:message_id` - Delete a message (sender only)
- `GET /api/messages/search/:user_id` - Search messages in a conversation

#### Send Message

```http
POST /api/messages/send
Content-Type: application/json

{
  "recipient_id": 2,
  "content": "Hello! How are you?",
  "message_type": "text"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "message": {
    "message_id": 1,
    "sender_id": 1,
    "recipient_id": 2,
    "content": "Hello! How are you?",
    "message_type": "text",
    "is_read": false,
    "created_at": "2023-01-01T12:00:00.000Z",
    "sender": {
      "user_id": 1,
      "username": "alice",
      "avatar_url": "https://example.com/alice.jpg"
    },
    "recipient": {
      "user_id": 2,
      "username": "bob",
      "avatar_url": "https://example.com/bob.jpg"
    }
  }
}
```

#### Get Conversation

```http
GET /api/messages/conversation/2?limit=50&offset=0
```

**Response:**

```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "messages": [
    {
      "message_id": 1,
      "sender_id": 1,
      "recipient_id": 2,
      "content": "Hello! How are you?",
      "message_type": "text",
      "is_read": true,
      "created_at": "2023-01-01T12:00:00.000Z",
      "sender": {
        "user_id": 1,
        "username": "alice",
        "avatar_url": "https://example.com/alice.jpg"
      }
    }
  ],
  "count": 1,
  "conversation_with": {
    "user_id": 2,
    "username": "bob",
    "avatar_url": "https://example.com/bob.jpg"
  }
}
```

#### Get All Conversations

```http
GET /api/messages/conversations
```

**Response:**

```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "conversations": [
    {
      "other_user": {
        "user_id": 2,
        "username": "bob",
        "avatar_url": "https://example.com/bob.jpg"
      },
      "last_message": {
        "content": "Hello! How are you?",
        "message_type": "text",
        "created_at": "2023-01-01T12:00:00.000Z"
      },
      "unread_count": 0
    }
  ],
  "count": 1
}
```

#### Mark Messages as Read

```http
PUT /api/messages/read/2
```

**Response:**

```json
{
  "success": true,
  "message": "Messages marked as read",
  "updated_count": 3
}
```

#### Get Unread Count

```http
GET /api/messages/unread-count
```

**Response:**

```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "unread_count": 5
}
```

#### Delete Message

```http
DELETE /api/messages/1
```

**Response:**

```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

#### Search Messages

```http
GET /api/messages/search/2?q=hello&limit=20
```

**Response:**

```json
{
  "success": true,
  "message": "Messages found",
  "messages": [
    {
      "message_id": 1,
      "sender_id": 1,
      "recipient_id": 2,
      "content": "Hello! How are you?",
      "message_type": "text",
      "is_read": true,
      "created_at": "2023-01-01T12:00:00.000Z",
      "sender": {
        "username": "alice",
        "avatar_url": "https://example.com/alice.jpg"
      }
    }
  ],
  "count": 1,
  "search_term": "hello"
}
```

### WebSocket

- `WS /api/friends/ws?token=<jwt_token>` - Real-time notifications for friends and messaging

## 🔐 Authentication

The API supports two authentication methods:

### 1. Cookie-Based Authentication (Recommended for Web)

When you login, the server automatically sets an HTTP-only cookie containing your JWT token. For subsequent requests, simply include credentials:

```javascript
// Login - automatically sets cookie
const response = await fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
  credentials: 'include', // Important: include cookies
})

// All authenticated requests - cookies sent automatically
const response = await fetch('/api/users/me', {
  credentials: 'include', // Include cookies automatically
})
```

### 2. Authorization Header (Fallback for Mobile/Special Cases)

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **Register/Login** to get a JWT token (returned in response body and set as cookie)
2. **Use cookies** for web applications (automatic with `credentials: 'include'`)
3. **Use Authorization header** for mobile apps or special cases

## 👥 Friends System

### Features

- Send and receive friend requests
- Accept/decline friend requests
- Remove friends
- Search for users
- Real-time notifications via WebSocket
- Online status tracking

## 💬 Private Messaging System

### Features

- Send/receive private messages between friends
- Real-time message delivery via WebSocket
- Message read status tracking
- Message deletion (sender only)
- Conversation history with pagination
- Message search within conversations
- Unread message count
- Message types support (text, image, file)

### Message Types

- `text` - Plain text messages (default)
- `image` - Image messages (for future file upload implementation)
- `file` - File messages (for future file upload implementation)

### WebSocket Events

Connect to WebSocket with your JWT token:

```javascript
const ws = new WebSocket(
  'ws://localhost:3000/api/friends/ws?token=YOUR_JWT_TOKEN'
)
```

#### Connection Events

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

#### Friend Request Events

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
```

#### Message Events

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
        "username": "alice",
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

#### Online Status Events

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

## 🧪 Testing

### Using Insomnia/Postman

1. **Create test users**:

   ```http
   POST /api/users/register
   Content-Type: application/json

   {
     "username": "alice",
     "password": "password123",
     "avatar_url": "https://example.com/alice.jpg"
   }
   ```

2. **Login to get JWT token and cookie**:

   ```http
   POST /api/users/login
   Content-Type: application/json

   {
     "username": "alice",
     "password": "password123"
   }
   ```

3. **Test protected endpoints** using either:
   - **Cookie authentication** (automatic with credentials)
   - **Authorization header**: `Authorization: Bearer <token>`

### Frontend Integration Examples

#### Cookie-Based Authentication (Recommended)

```javascript
// Login and get cookie
const login = async (username, password) => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include', // Important: include cookies
  })
  return response.json()
}

// All authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies automatically
  })
  return response
}

// Usage examples
const getFriends = () => fetchWithAuth('/api/friends/')
const sendMessage = (recipientId, content) =>
  fetchWithAuth('/api/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient_id: recipientId, content }),
  })
```

#### WebSocket Connection

```javascript
// Connect to WebSocket (still needs token in URL)
const connectWebSocket = () => {
  const token = localStorage.getItem('jwt_token') // From login response
  const ws = new WebSocket(`ws://localhost:3000/api/friends/ws?token=${token}`)

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    switch (message.type) {
      case 'new_message':
        displayNewMessage(message.data.message)
        break
      case 'friend_request_received':
        showNotification(
          `New friend request from ${message.data.requester.username}`
        )
        break
    }
  }

  return ws
}
```

### WebSocket Testing

Use browser console or WebSocket testing tools:

```javascript
// Connect to WebSocket
const token = 'your-jwt-token-here'
const ws = new WebSocket(`ws://localhost:3000/api/friends/ws?token=${token}`)

ws.onopen = () => console.log('Connected')
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  console.log('Received:', message)
}

// Send ping
ws.send(JSON.stringify({ type: 'ping' }))
```

## 📊 Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400
}
```

## 🚨 Error Codes

- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (can only send messages to friends)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate requests, already friends)
- `500` - Internal Server Error

## 🔧 Configuration

### Environment Variables

| Variable               | Description                          | Default                                           |
| ---------------------- | ------------------------------------ | ------------------------------------------------- |
| `JWT_SECRET`           | Secret key for JWT tokens            | `your-secret-key-change-this-in-production`       |
| `COOKIE_SECRET`        | Secret key for signed cookies        | `your-cookie-secret-change-this`                  |
| `NODE_ENV`             | Environment (production/development) | `development`                                     |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID               | Required for OAuth                                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret           | Required for OAuth                                |
| `GOOGLE_REDIRECT_URI`  | OAuth redirect URI                   | `http://localhost:3000/api/oauth/google/callback` |

### Database

The application uses SQLite with automatic schema initialization. The database file is created at `src/database/database.sqlite` on first run.

## 🏗️ Development

### Code Structure Principles

- **Modular Design**: Each feature is organized in separate modules
- **Separation of Concerns**: Controllers handle HTTP logic, services handle business logic
- **DRY Principle**: Reusable utility functions and services
- **Clean Code**: Descriptive naming and proper error handling
- **Input Validation**: All inputs are validated and sanitized

### Adding New Features

1. **Create service** in `src/services/` for business logic
2. **Create controller** in `src/controllers/` for HTTP handling
3. **Create route** in `src/routes/` for endpoint definition
4. **Add validation** in `src/utils/` if needed
5. **Update database schema** in `src/database/schema.sql` if needed

## 🚀 Deployment

### Production Considerations

1. **Change JWT and cookie secrets** to secure random strings
2. **Set NODE_ENV=production** for secure cookie settings
3. **Set up proper OAuth redirect URIs** for your domain
4. **Use environment variables** for all configuration
5. **Set up proper logging** and monitoring
6. **Use HTTPS** for production (required for secure cookies)
7. **Configure CORS** properly for frontend integration
8. **Set up database backups** for SQLite data

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 License

This project is part of the Transcendence curriculum at 42 School.

## 🤝 Contributing

1. Follow the existing code style and structure
2. Add proper error handling and validation
3. Write clear commit messages
4. Test your changes thoroughly

## 📞 Support

For issues and questions, please refer to the project documentation or contact the development team.
