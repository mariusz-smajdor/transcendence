/**
 * Creates a standardized success response
 * @param {string} message - Success message
 * @param {object} data - Response data
 * @returns {object} Standardized success response
 */
export const createSuccessResponse = (message, data = {}) => ({
	success: true,
	message,
	...data,
});

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {string} error - Detailed error information
 * @param {number} statusCode - HTTP status code
 * @returns {object} Standardized error response
 */
export const createErrorResponse = (
	message,
	error = null,
	statusCode = 400
) => ({
	success: false,
	message,
	...(error && { error }),
	...(statusCode && { statusCode }),
});

/**
 * Creates a standardized user response
 * @param {object} user - User data
 * @param {string} token - JWT token (optional)
 * @returns {object} Standardized user response
 */
export const createUserResponse = (user, token = null) => ({
	success: true,
	message: "Authentication successful",
	user: {
		user_id: user.user_id,
		username: user.username,
		avatar_url: user.avatar_url,
		email: user.email,
	},
});
