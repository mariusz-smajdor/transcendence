import { createUser, findUserByUsername } from '../services/userService.js'
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from '../services/authService.js'
import {
  validateRegistrationData,
  validateLoginData,
} from '../utils/userValidation.js'
import {
  createSuccessResponse,
  createErrorResponse,
  createUserResponse,
} from '../utils/responseHelpers.js'

export const addUser = async (request, reply) => {
  try {
    const { username, password, avatar_url } = request.body

    // Validate input data
    const validation = validateRegistrationData(username, password)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await createUser(username, hashedPassword, avatar_url)

    return reply.code(201).send(
      createSuccessResponse('User created successfully', {
        user_id: user.user_id,
        username: user.username,
        avatar_url: user.avatar_url,
      })
    )
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return reply
        .code(409)
        .send(createErrorResponse('Username already exists', null, 409))
    }

    console.error('User creation error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to create user', null, 500))
  }
}

export const loginUser = async (request, reply) => {
  try {
    const { username, password } = request.body

    // Validate input data
    const validation = validateLoginData(username, password)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    // Find user
    const user = await findUserByUsername(username)
    if (!user) {
      return reply
        .code(401)
        .send(createErrorResponse('Invalid username or password', null, 401))
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return reply
        .code(401)
        .send(createErrorResponse('Invalid username or password', null, 401))
    }

    // Generate JWT token
    const token = await generateToken(reply, {
      user_id: user.user_id,
      username: user.username,
    })

    return reply.code(200).send(createUserResponse(user, token))
  } catch (error) {
    console.error('Login error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Internal server error', null, 500))
  }
}

export const getCurrentUser = async (request, reply) => {
  try {
    // JWT token is automatically verified by FastifyJWT middleware
    // User data is available in request.user
    const { user_id, username } = request.user

    // Get fresh user data from database
    const user = await findUserByUsername(username)
    if (!user) {
      return reply
        .code(404)
        .send(createErrorResponse('User not found', null, 404))
    }

    return reply.code(200).send(
      createSuccessResponse('User data retrieved successfully', {
        user_id: user.user_id,
        username: user.username,
        avatar_url: user.avatar_url,
        email: user.email,
      })
    )
  } catch (error) {
    console.error('Get current user error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Internal server error', null, 500))
  }
}

export const logoutUser = async (request, reply) => {
  try {
    // Clear the JWT cookie
    reply.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return reply
      .code(200)
      .send(createSuccessResponse('Logged out successfully'))
  } catch (error) {
    console.error('Logout error:', error)
    return reply.code(500).send(createErrorResponse('Logout failed', null, 500))
  }
}
