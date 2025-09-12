export const validateFriendRequest = (username) => {
  const errors = []

  if (!username || username.trim().length === 0) {
    errors.push('Username is required')
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  } else if (username.length > 50) {
    errors.push('Username must be less than 50 characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateSearchQuery = (query) => {
  const errors = []

  if (!query || query.trim().length === 0) {
    errors.push('Search query is required')
  } else if (query.length < 2) {
    errors.push('Search query must be at least 2 characters long')
  } else if (query.length > 50) {
    errors.push('Search query must be less than 50 characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateFriendshipId = (friendshipId) => {
  const errors = []

  if (!friendshipId) {
    errors.push('Friendship ID is required')
  } else if (isNaN(parseInt(friendshipId))) {
    errors.push('Friendship ID must be a valid number')
  } else if (parseInt(friendshipId) <= 0) {
    errors.push('Friendship ID must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateUserId = (userId) => {
  const errors = []

  if (!userId) {
    errors.push('User ID is required')
  } else if (isNaN(parseInt(userId))) {
    errors.push('User ID must be a valid number')
  } else if (parseInt(userId) <= 0) {
    errors.push('User ID must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
