export const authenticateToken = async (request, reply) => {
  try {
    // First try to verify JWT from cookie (automatic with fastify-jwt cookie config)
    await request.jwtVerify()
  } catch (cookieError) {
    try {
      // If cookie verification fails, try Authorization header
      const authHeader = request.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        // Manually verify the token from header
        const decoded = request.server.jwt.verify(token)
        request.user = decoded
      } else {
        throw new Error('No valid authentication found')
      }
    } catch (headerError) {
      reply.code(401).send({
        success: false,
        message: 'Unauthorized - No valid authentication token found',
        error: 'Authentication required',
      })
    }
  }
}
