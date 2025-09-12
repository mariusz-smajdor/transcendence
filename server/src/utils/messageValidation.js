// Validation functions for message-related operations

// Validate message content
export const validateMessageContent = (content) => {
  const errors = []

  if (!content) {
    errors.push('Message content is required')
  } else if (typeof content !== 'string') {
    errors.push('Message content must be a string')
  } else if (content.trim().length === 0) {
    errors.push('Message content cannot be empty')
  } else if (content.length > 2000) {
    errors.push('Message content cannot exceed 2000 characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validate user ID
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

// Validate message ID
export const validateMessageId = (messageId) => {
  const errors = []

  if (!messageId) {
    errors.push('Message ID is required')
  } else if (isNaN(parseInt(messageId))) {
    errors.push('Message ID must be a valid number')
  } else if (parseInt(messageId) <= 0) {
    errors.push('Message ID must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validate search query
export const validateSearchQuery = (searchTerm) => {
  const errors = []

  if (!searchTerm) {
    errors.push('Search term is required')
  } else if (typeof searchTerm !== 'string') {
    errors.push('Search term must be a string')
  } else if (searchTerm.trim().length === 0) {
    errors.push('Search term cannot be empty')
  } else if (searchTerm.length > 100) {
    errors.push('Search term cannot exceed 100 characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validate message type
export const validateMessageType = (messageType) => {
  const errors = []
  const validTypes = ['text', 'image', 'file']

  if (!messageType) {
    errors.push('Message type is required')
  } else if (!validTypes.includes(messageType)) {
    errors.push(`Message type must be one of: ${validTypes.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validate pagination parameters
export const validatePagination = (limit, offset) => {
  const errors = []

  if (limit !== undefined) {
    if (isNaN(parseInt(limit))) {
      errors.push('Limit must be a valid number')
    } else if (parseInt(limit) < 1) {
      errors.push('Limit must be at least 1')
    } else if (parseInt(limit) > 100) {
      errors.push('Limit cannot exceed 100')
    }
  }

  if (offset !== undefined) {
    if (isNaN(parseInt(offset))) {
      errors.push('Offset must be a valid number')
    } else if (parseInt(offset) < 0) {
      errors.push('Offset must be non-negative')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
