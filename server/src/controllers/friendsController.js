import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getFriendshipStatus,
  searchUsers,
} from '../services/friendsService.js'
import { findUserByUsername } from '../services/userService.js'
import {
  createSuccessResponse,
  createErrorResponse,
} from '../utils/responseHelpers.js'
import {
  validateFriendRequest,
  validateSearchQuery,
  validateFriendshipId,
  validateUserId,
} from '../utils/friendsValidation.js'

// Send friend request
export const sendRequest = async (request, reply) => {
  try {
    const { username } = request.body
    const { user_id: requesterId } = request.user

    // Validate input
    const validation = validateFriendRequest(username)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    // Find target user
    const targetUser = await findUserByUsername(username)
    if (!targetUser) {
      return reply.code(404).send(createErrorResponse('User not found'))
    }

    // Can't send request to yourself
    if (targetUser.user_id === requesterId) {
      return reply
        .code(400)
        .send(createErrorResponse('Cannot send friend request to yourself'))
    }

    // Check if friendship already exists
    const existingFriendship = await getFriendshipStatus(
      requesterId,
      targetUser.user_id
    )
    if (existingFriendship) {
      const statusMessages = {
        pending: 'Friend request already sent',
        accepted: 'Already friends',
        blocked: 'Cannot send friend request',
      }
      return reply
        .code(400)
        .send(createErrorResponse(statusMessages[existingFriendship.status]))
    }

    // Send friend request
    const friendRequest = await sendFriendRequest(
      requesterId,
      targetUser.user_id
    )

    return reply.code(201).send(
      createSuccessResponse('Friend request sent successfully', {
        friendship_id: friendRequest.friendship_id,
        target_user: {
          user_id: targetUser.user_id,
          username: targetUser.username,
          avatar_url: targetUser.avatar_url,
        },
      })
    )
  } catch (error) {
    console.error('Send friend request error:', error)
    if (error.message.includes('UNIQUE constraint failed')) {
      return reply
        .code(409)
        .send(createErrorResponse('Friend request already exists'))
    }
    return reply
      .code(500)
      .send(createErrorResponse('Failed to send friend request'))
  }
}

// Accept friend request
export const acceptRequest = async (request, reply) => {
  try {
    const { friendship_id } = request.params
    const { user_id: userId } = request.user

    // Validate friendship ID
    const validation = validateFriendshipId(friendship_id)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    await acceptFriendRequest(parseInt(friendship_id), userId)

    return reply
      .code(200)
      .send(createSuccessResponse('Friend request accepted'))
  } catch (error) {
    console.error('Accept friend request error:', error)
    if (
      error.message.includes('not found') ||
      error.message.includes('already processed')
    ) {
      return reply
        .code(404)
        .send(
          createErrorResponse('Friend request not found or already processed')
        )
    }
    return reply
      .code(500)
      .send(createErrorResponse('Failed to accept friend request'))
  }
}

// Decline friend request
export const declineRequest = async (request, reply) => {
  try {
    const { friendship_id } = request.params
    const { user_id: userId } = request.user

    // Validate friendship ID
    const validation = validateFriendshipId(friendship_id)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    await declineFriendRequest(parseInt(friendship_id), userId)

    return reply
      .code(200)
      .send(createSuccessResponse('Friend request declined'))
  } catch (error) {
    console.error('Decline friend request error:', error)
    if (error.message.includes('not found')) {
      return reply
        .code(404)
        .send(createErrorResponse('Friend request not found'))
    }
    return reply
      .code(500)
      .send(createErrorResponse('Failed to decline friend request'))
  }
}

// Remove friend
export const removeFriendship = async (request, reply) => {
  try {
    const { friend_id } = request.params
    const { user_id: userId } = request.user

    // Validate friend ID
    const validation = validateUserId(friend_id)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    // Can't remove yourself
    if (parseInt(friend_id) === userId) {
      return reply
        .code(400)
        .send(createErrorResponse('Cannot remove yourself as a friend'))
    }

    await removeFriend(userId, parseInt(friend_id))

    return reply
      .code(200)
      .send(createSuccessResponse('Friend removed successfully'))
  } catch (error) {
    console.error('Remove friend error:', error)
    if (error.message.includes('not found')) {
      return reply.code(404).send(createErrorResponse('Friendship not found'))
    }
    return reply.code(500).send(createErrorResponse('Failed to remove friend'))
  }
}

// Get friends list
export const getFriendsList = async (request, reply) => {
  try {
    const { user_id: userId } = request.user

    const friends = await getFriends(userId)

    return reply.code(200).send(
      createSuccessResponse('Friends retrieved successfully', {
        friends,
        count: friends.length,
      })
    )
  } catch (error) {
    console.error('Get friends error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to retrieve friends'))
  }
}

// Get pending friend requests
export const getPendingRequestsList = async (request, reply) => {
  try {
    const { user_id: userId } = request.user

    const pendingRequests = await getPendingRequests(userId)

    return reply.code(200).send(
      createSuccessResponse('Pending requests retrieved successfully', {
        pending_requests: pendingRequests,
        count: pendingRequests.length,
      })
    )
  } catch (error) {
    console.error('Get pending requests error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to retrieve pending requests'))
  }
}

// Get sent friend requests
export const getSentRequestsList = async (request, reply) => {
  try {
    const { user_id: userId } = request.user

    const sentRequests = await getSentRequests(userId)

    return reply.code(200).send(
      createSuccessResponse('Sent requests retrieved successfully', {
        sent_requests: sentRequests,
        count: sentRequests.length,
      })
    )
  } catch (error) {
    console.error('Get sent requests error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to retrieve sent requests'))
  }
}

// Search users
export const searchUsersController = async (request, reply) => {
  try {
    const { q: searchTerm, limit = 10 } = request.query
    const { user_id: userId } = request.user

    // Validate search query
    const validation = validateSearchQuery(searchTerm)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    // Validate limit
    const searchLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50) // Between 1 and 50

    const users = await searchUsers(userId, searchTerm.trim(), searchLimit)

    return reply.code(200).send(
      createSuccessResponse('Users found', {
        users,
        count: users.length,
        search_term: searchTerm.trim(),
        limit: searchLimit,
      })
    )
  } catch (error) {
    console.error('Search users error:', error)
    return reply.code(500).send(createErrorResponse('Failed to search users'))
  }
}

// Get friendship dashboard (friends + pending requests)
export const getDashboard = async (request, reply) => {
  try {
    const { user_id: userId } = request.user

    const [friends, pendingRequests, sentRequests] = await Promise.all([
      getFriends(userId),
      getPendingRequests(userId),
      getSentRequests(userId),
    ])

    return reply.code(200).send(
      createSuccessResponse('Dashboard data retrieved successfully', {
        friends: {
          list: friends,
          count: friends.length,
        },
        pending_requests: {
          list: pendingRequests,
          count: pendingRequests.length,
        },
        sent_requests: {
          list: sentRequests,
          count: sentRequests.length,
        },
      })
    )
  } catch (error) {
    console.error('Get dashboard error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to retrieve dashboard data'))
  }
}

// Get friendship status with another user
export const getFriendshipStatusController = async (request, reply) => {
  try {
    const { user_id } = request.params
    const { user_id: currentUserId } = request.user

    // Validate user ID
    const validation = validateUserId(user_id)
    if (!validation.isValid) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Validation failed', validation.errors.join(', '))
        )
    }

    const targetUserId = parseInt(user_id)

    // Can't check status with yourself
    if (targetUserId === currentUserId) {
      return reply
        .code(400)
        .send(
          createErrorResponse('Cannot check friendship status with yourself')
        )
    }

    const friendshipStatus = await getFriendshipStatus(
      currentUserId,
      targetUserId
    )

    let status = 'none'
    let canSendRequest = true
    let friendship_id = null

    if (friendshipStatus) {
      status = friendshipStatus.status
      friendship_id = friendshipStatus.friendship_id
      canSendRequest = false
    }

    return reply.code(200).send(
      createSuccessResponse('Friendship status retrieved', {
        target_user_id: targetUserId,
        status,
        friendship_id,
        can_send_request: canSendRequest,
        is_requester: friendshipStatus
          ? friendshipStatus.requester_id === currentUserId
          : false,
      })
    )
  } catch (error) {
    console.error('Get friendship status error:', error)
    return reply
      .code(500)
      .send(createErrorResponse('Failed to retrieve friendship status'))
  }
}
