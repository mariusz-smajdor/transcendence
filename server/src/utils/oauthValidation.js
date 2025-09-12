export const validateGoogleProfile = (profile) => {
  const errors = [];

  if (!profile) {
    errors.push("Profile data is missing");
    return { isValid: false, errors };
  }

  if (!profile.id) {
    errors.push("Google ID is missing");
  }

  // Google OAuth2 API returns email directly, not in emails array
  if (!profile.email) {
    errors.push("Email is required from Google profile");
  }

  // Check for name or email (Google returns 'name' not 'displayName')
  if (!profile.name && !profile.email) {
    errors.push("Name or email is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const extractUserData = (profile) => {
  // Google OAuth2 API returns data directly, not in nested objects
  const email = profile.email;
  const displayName = profile.name;
  const avatarUrl = profile.picture;

  return {
    email,
    displayName,
    avatarUrl,
    googleId: profile.id,
    username: displayName || email?.split("@")[0] || "user",
  };
};
