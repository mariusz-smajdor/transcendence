import { createUser, findUserByEmail } from "./userService.js";
import { generateToken } from "./authService.js";
import {
  validateGoogleProfile,
  extractUserData,
} from "../utils/oauthValidation.js";

export const handleGoogleOAuthUser = async (profile, reply) => {
  try {
    // Validate Google profile data
    const validation = validateGoogleProfile(profile);
    if (!validation.isValid) {
      throw new Error(
        `Invalid Google profile: ${validation.errors.join(", ")}`
      );
    }

    // Extract user data from profile
    const { email, displayName, avatarUrl, googleId, username } =
      extractUserData(profile);

    // Check if user exists by email
    let user = await findUserByEmail(email);

    if (!user) {
      // Create new user with OAuth data
      user = await createUser(username, null, avatarUrl, email);
    }

    // Generate JWT token
    const token = await generateToken(reply, {
      user_id: user.user_id,
      username: user.username,
    });

    return {
      user_id: user.user_id,
      username: user.username,
      avatar_url: user.avatar_url,
      token: token,
    };
  } catch (error) {
    console.error("Google OAuth user handling error:", error);
    throw new Error(`OAuth authentication failed: ${error.message}`);
  }
};
