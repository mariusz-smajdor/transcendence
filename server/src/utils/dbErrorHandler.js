/**
 * Parse SQLite constraint errors into user-friendly messages
 * @param {Error} error - The database error object
 * @returns {string} User-friendly error message
 */
export function parseDbError(error) {
  // Handle SQLite constraint errors
  if (
    error.code === 'SQLITE_CONSTRAINT' ||
    error.message?.includes('UNIQUE constraint failed')
  ) {
    const message = error.message;

    // Check which field caused the constraint violation
    if (message.includes('users.username')) {
      return 'This username is already taken';
    }
    if (message.includes('users.email')) {
      return 'This email is already registered';
    }
    if (message.includes('users.google_id')) {
      return 'This Google account is already linked to another user';
    }
    if (message.includes('friends')) {
      return 'Friendship already exists';
    }
    if (message.includes('friend_requests')) {
      return 'Friend request already sent';
    }
    if (message.includes('blocked_users')) {
      return 'User is already blocked';
    }

    // Generic constraint error
    return 'This value is already in use';
  }

  // Handle foreign key constraint errors
  if (
    error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
    error.message?.includes('FOREIGN KEY constraint')
  ) {
    return 'Invalid reference to another record';
  }

  // Handle not null constraint
  if (
    error.code === 'SQLITE_CONSTRAINT_NOTNULL' ||
    error.message?.includes('NOT NULL constraint')
  ) {
    return 'Required field is missing';
  }

  // Default error message for database errors
  if (error.code?.startsWith('SQLITE_')) {
    return 'Database operation failed';
  }

  // Return original message for non-DB errors (but sanitized)
  return error.message || 'An unexpected error occurred';
}

/**
 * Create a standardized error response
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if parsing fails
 * @returns {Object} Error response object
 */
export function createErrorResponse(
  error,
  defaultMessage = 'Operation failed',
) {
  const message = parseDbError(error);
  const isDbError = error.code?.startsWith('SQLITE_');

  return {
    success: false,
    message: message,
    code: isDbError ? 400 : 500,
  };
}
