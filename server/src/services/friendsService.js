import { db } from '../database/init.js'
import {
  WebSocketService,
  WEBSOCKET_MESSAGE_TYPES,
} from './websocketService.js'

// Send a friend request
export const sendFriendRequest = async (requesterId, addresseeId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO friendships (requester_id, addressee_id, status) 
      VALUES (?, ?, 'pending')
    `

    db.run(sql, [requesterId, addresseeId], async function (err) {
      if (err) {
        reject(err)
      } else {
        const friendshipData = {
          friendship_id: this.lastID,
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending',
        }

        // Get requester info for notification
        try {
          const requesterInfo = await getUserById(requesterId)

          // Send real-time notification to addressee
          WebSocketService.sendToUser(addresseeId, {
            type: WEBSOCKET_MESSAGE_TYPES.FRIEND_REQUEST_RECEIVED,
            data: {
              friendship_id: friendshipData.friendship_id,
              requester: {
                user_id: requesterInfo.user_id,
                username: requesterInfo.username,
                avatar_url: requesterInfo.avatar_url,
              },
              created_at: new Date().toISOString(),
            },
          })

          resolve(friendshipData)
        } catch (notificationError) {
          // Still resolve the friend request even if notification fails
          console.error(
            'Failed to send friend request notification:',
            notificationError
          )
          resolve(friendshipData)
        }
      }
    })
  })
}

// Accept a friend request
export const acceptFriendRequest = async (friendshipId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE friendships 
      SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
      WHERE friendship_id = ? AND addressee_id = ? AND status = 'pending'
    `

    db.run(sql, [friendshipId, userId], async function (err) {
      if (err) {
        reject(err)
      } else if (this.changes === 0) {
        reject(new Error('Friend request not found or already processed'))
      } else {
        try {
          // Get friendship details for notifications
          const friendship = await getFriendshipById(friendshipId)
          const [requesterInfo, addresseeInfo] = await Promise.all([
            getUserById(friendship.requester_id),
            getUserById(friendship.addressee_id),
          ])

          // Send notification to requester
          WebSocketService.sendToUser(friendship.requester_id, {
            type: WEBSOCKET_MESSAGE_TYPES.FRIEND_REQUEST_ACCEPTED,
            data: {
              friendship_id: friendshipId,
              friend: {
                user_id: addresseeInfo.user_id,
                username: addresseeInfo.username,
                avatar_url: addresseeInfo.avatar_url,
              },
              accepted_at: new Date().toISOString(),
            },
          })

          // Send friends list update to both users
          const [requesterFriends, addresseeFriends] = await Promise.all([
            getFriends(friendship.requester_id),
            getFriends(friendship.addressee_id),
          ])

          WebSocketService.sendToUser(friendship.requester_id, {
            type: WEBSOCKET_MESSAGE_TYPES.FRIENDS_LIST_UPDATE,
            data: { friends: requesterFriends },
          })

          WebSocketService.sendToUser(friendship.addressee_id, {
            type: WEBSOCKET_MESSAGE_TYPES.FRIENDS_LIST_UPDATE,
            data: { friends: addresseeFriends },
          })

          resolve({ success: true })
        } catch (notificationError) {
          console.error(
            'Failed to send accept notification:',
            notificationError
          )
          resolve({ success: true })
        }
      }
    })
  })
}

// Decline/cancel a friend request
export const declineFriendRequest = async (friendshipId, userId) => {
  return new Promise((resolve, reject) => {
    // First get friendship details for notification
    const getFriendshipSql = `
      SELECT requester_id, addressee_id FROM friendships 
      WHERE friendship_id = ? AND (addressee_id = ? OR requester_id = ?) AND status = 'pending'
    `

    db.get(
      getFriendshipSql,
      [friendshipId, userId, userId],
      (err, friendship) => {
        if (err) {
          reject(err)
          return
        }

        if (!friendship) {
          reject(new Error('Friend request not found'))
          return
        }

        const deleteSql = `
        DELETE FROM friendships 
        WHERE friendship_id = ? AND (addressee_id = ? OR requester_id = ?) AND status = 'pending'
      `

        db.run(deleteSql, [friendshipId, userId, userId], async function (err) {
          if (err) {
            reject(err)
          } else if (this.changes === 0) {
            reject(new Error('Friend request not found'))
          } else {
            try {
              // Notify the other user about the declined request
              const otherUserId =
                friendship.requester_id === userId
                  ? friendship.addressee_id
                  : friendship.requester_id
              const declinerInfo = await getUserById(userId)

              WebSocketService.sendToUser(otherUserId, {
                type: WEBSOCKET_MESSAGE_TYPES.FRIEND_REQUEST_DECLINED,
                data: {
                  friendship_id: friendshipId,
                  declined_by: {
                    user_id: declinerInfo.user_id,
                    username: declinerInfo.username,
                    avatar_url: declinerInfo.avatar_url,
                  },
                  declined_at: new Date().toISOString(),
                },
              })

              resolve({ success: true })
            } catch (notificationError) {
              console.error(
                'Failed to send decline notification:',
                notificationError
              )
              resolve({ success: true })
            }
          }
        })
      }
    )
  })
}

// Remove a friend
export const removeFriend = async (userId, friendId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM friendships 
      WHERE ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)) 
      AND status = 'accepted'
    `

    db.run(sql, [userId, friendId, friendId, userId], async function (err) {
      if (err) {
        reject(err)
      } else if (this.changes === 0) {
        reject(new Error('Friendship not found'))
      } else {
        try {
          const [userInfo, friendInfo] = await Promise.all([
            getUserById(userId),
            getUserById(friendId),
          ])

          // Notify both users about friendship removal
          WebSocketService.sendToUser(friendId, {
            type: WEBSOCKET_MESSAGE_TYPES.FRIEND_REMOVED,
            data: {
              removed_by: {
                user_id: userInfo.user_id,
                username: userInfo.username,
                avatar_url: userInfo.avatar_url,
              },
              removed_at: new Date().toISOString(),
            },
          })

          // Send updated friends list to both users
          const [userFriends, friendFriends] = await Promise.all([
            getFriends(userId),
            getFriends(friendId),
          ])

          WebSocketService.sendToUser(userId, {
            type: WEBSOCKET_MESSAGE_TYPES.FRIENDS_LIST_UPDATE,
            data: { friends: userFriends },
          })

          WebSocketService.sendToUser(friendId, {
            type: WEBSOCKET_MESSAGE_TYPES.FRIENDS_LIST_UPDATE,
            data: { friends: friendFriends },
          })

          resolve({ success: true })
        } catch (notificationError) {
          console.error(
            'Failed to send removal notification:',
            notificationError
          )
          resolve({ success: true })
        }
      }
    })
  })
}

// Get all friends for a user
export const getFriends = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        f.friendship_id,
        f.created_at as friendship_date,
        CASE 
          WHEN f.requester_id = ? THEN u2.user_id
          ELSE u1.user_id
        END as friend_id,
        CASE 
          WHEN f.requester_id = ? THEN u2.username
          ELSE u1.username
        END as username,
        CASE 
          WHEN f.requester_id = ? THEN u2.avatar_url
          ELSE u1.avatar_url
        END as avatar_url
      FROM friendships f
      JOIN users u1 ON f.requester_id = u1.user_id
      JOIN users u2 ON f.addressee_id = u2.user_id
      WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
      ORDER BY f.created_at DESC
    `

    db.all(sql, [userId, userId, userId, userId, userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        // Add online status to each friend
        const friendsWithStatus = (rows || []).map((friend) => ({
          ...friend,
          is_online: WebSocketService.isUserOnline(friend.friend_id),
        }))
        resolve(friendsWithStatus)
      }
    })
  })
}

// Get pending friend requests (received)
export const getPendingRequests = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        f.friendship_id,
        f.created_at as request_date,
        u.user_id as requester_id,
        u.username,
        u.avatar_url
      FROM friendships f
      JOIN users u ON f.requester_id = u.user_id
      WHERE f.addressee_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows || [])
      }
    })
  })
}

// Get sent friend requests (pending)
export const getSentRequests = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        f.friendship_id,
        f.created_at as request_date,
        u.user_id as addressee_id,
        u.username,
        u.avatar_url
      FROM friendships f
      JOIN users u ON f.addressee_id = u.user_id
      WHERE f.requester_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows || [])
      }
    })
  })
}

// Check friendship status between two users
export const getFriendshipStatus = async (userId, otherUserId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        friendship_id,
        requester_id,
        addressee_id,
        status
      FROM friendships 
      WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
    `

    db.get(sql, [userId, otherUserId, otherUserId, userId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row || null)
      }
    })
  })
}

// Search users (excluding current user and existing friends/requests)
export const searchUsers = async (userId, searchTerm, limit = 10) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        u.user_id,
        u.username,
        u.avatar_url
      FROM users u
      WHERE u.user_id != ? 
        AND u.username LIKE ?
        AND u.user_id NOT IN (
          SELECT CASE 
            WHEN requester_id = ? THEN addressee_id 
            ELSE requester_id 
          END
          FROM friendships 
          WHERE (requester_id = ? OR addressee_id = ?)
        )
      ORDER BY u.username
      LIMIT ?
    `

    const searchPattern = `%${searchTerm}%`
    db.all(
      sql,
      [userId, searchPattern, userId, userId, userId, limit],
      (err, rows) => {
        if (err) {
          reject(err)
        } else {
          // Add online status to search results
          const usersWithStatus = (rows || []).map((user) => ({
            ...user,
            is_online: WebSocketService.isUserOnline(user.user_id),
          }))
          resolve(usersWithStatus)
        }
      }
    )
  })
}

// Helper functions
const getUserById = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT user_id, username, avatar_url, email FROM users WHERE user_id = ?'
    db.get(sql, [userId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

const getFriendshipById = async (friendshipId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM friendships WHERE friendship_id = ?'
    db.get(sql, [friendshipId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

// Notify friends when user comes online/offline
export const notifyFriendsOnlineStatus = async (userId, isOnline) => {
  try {
    const friends = await getFriends(userId)
    const userInfo = await getUserById(userId)

    const message = {
      type: isOnline
        ? WEBSOCKET_MESSAGE_TYPES.USER_ONLINE
        : WEBSOCKET_MESSAGE_TYPES.USER_OFFLINE,
      data: {
        user: {
          user_id: userInfo.user_id,
          username: userInfo.username,
          avatar_url: userInfo.avatar_url,
        },
        timestamp: new Date().toISOString(),
      },
    }

    // Notify all friends about user's online status change
    friends.forEach((friend) => {
      WebSocketService.sendToUser(friend.friend_id, message)
    })
  } catch (error) {
    console.error('Failed to notify friends about online status:', error)
  }
}
