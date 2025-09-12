# Transcendence Backend

A Node.js backend API built with Fastify for the Transcendence project, featuring user authentication, OAuth integration, and a real-time friends system with WebSocket support.

## 🚀 Features

- **User Management**: Registration, login, and profile management
- **OAuth Integration**: Google OAuth2 authentication
- **Friends System**: Complete friends management with real-time notifications
- **WebSocket Support**: Real-time communication for friends features
- **JWT Authentication**: Secure token-based authentication
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
│   ├── oauth.js
│   └── users.js
├── services/             # Business logic
│   ├── authService.js
│   ├── friendsService.js
│   ├── googleProfileService.js
│   ├── oauthService.js
│   ├── userService.js
│   ├── websocketHandler.js
│   └── websocketService.js
└── utils/                # Utility functions
    ├── friendsValidation.js
    ├── oauthValidation.js
    ├── responseHelpers.js
    └── userValidation.js
```

## 🔌 API Endpoints

### Health Check

- `GET /api/health` - Server health status

### User Management

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user info (requires auth)

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

### WebSocket

- `WS /api/friends/ws?token=<jwt_token>` - Real-time notifications

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **Register/Login** to get a JWT token
2. **Use the token** in subsequent requests

## 👥 Friends System

### Features

- Send and receive friend requests
- Accept/decline friend requests
- Remove friends
- Search for users
- Real-time notifications via WebSocket
- Online status tracking

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

2. **Login to get JWT token**:

   ```http
   POST /api/users/login
   Content-Type: application/json

   {
     "username": "alice",
     "password": "password123"
   }
   ```

3. **Test friends endpoints** with the JWT token in Authorization header

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
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate requests, already friends)
- `500` - Internal Server Error

## 🔧 Configuration

### Environment Variables

| Variable               | Description                | Default                                           |
| ---------------------- | -------------------------- | ------------------------------------------------- |
| `JWT_SECRET`           | Secret key for JWT tokens  | `your-secret-key-change-this-in-production`       |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     | Required for OAuth                                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Required for OAuth                                |
| `GOOGLE_REDIRECT_URI`  | OAuth redirect URI         | `http://localhost:3000/api/oauth/google/callback` |

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

1. **Change JWT secret** to a secure random string
2. **Set up proper OAuth redirect URIs** for your domain
3. **Use environment variables** for all configuration
4. **Set up proper logging** and monitoring
5. **Use HTTPS** for production
6. **Configure CORS** if needed for frontend integration

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
