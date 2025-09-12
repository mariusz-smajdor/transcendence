/**
 * Fetches user profile from Google OAuth2 API
 * @param {string} accessToken - Google access token
 * @returns {Promise<object>} Google user profile
 * @throws {Error} If profile fetch fails
 */
export const fetchGoogleUserProfile = async (accessToken) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Google profile: ${response.statusText}`);
    }

    const profile = await response.json();

    if (!profile.id) {
      throw new Error("Invalid Google profile response");
    }

    return profile;
  } catch (error) {
    console.error("Error fetching Google user profile:", error);
    throw new Error("Failed to retrieve user profile from Google");
  }
};
