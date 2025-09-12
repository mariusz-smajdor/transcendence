import { handleGoogleOAuthUser } from "../services/oauthService.js";
import { fetchGoogleUserProfile } from "../services/googleProfileService.js";
import {
  createSuccessResponse,
  createErrorResponse,
  createUserResponse,
} from "../utils/responseHelpers.js";

/**
 * Initiates Google OAuth login flow
 * The actual OAuth flow is handled by @fastify/oauth2 plugin
 */
export const googleLogin = async (request, reply) => {
  // This will redirect to Google OAuth
  // The actual OAuth flow is handled by @fastify/oauth2
};

/**
 * Handles Google OAuth callback and processes user authentication
 */
export const googleCallback = async (request, reply) => {
  try {
    const accessToken = await getAccessTokenFromGoogle(request);
    const profile = await fetchGoogleUserProfile(accessToken);
    const authResult = await handleGoogleOAuthUser(profile, reply);

    return reply.send(createUserResponse(authResult, authResult.token));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return reply
      .code(400)
      .send(createErrorResponse("OAuth authentication failed", error.message));
  }
};

/**
 * Extracts access token from Google OAuth flow
 * @param {object} request - Fastify request object
 * @returns {Promise<string>} Google access token
 * @throws {Error} If no access token is received
 */
const getAccessTokenFromGoogle = async (request) => {
  const { token } =
    await request.server.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
      request
    );

  if (!token?.access_token) {
    throw new Error("No access token received from Google");
  }

  return token.access_token;
};
