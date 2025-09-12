export const getOAuthConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn(
      "Google OAuth credentials not found in environment variables. Using placeholder values."
    );
  }

  return {
    google: {
      clientId: clientId || "your-google-client-id",
      clientSecret: clientSecret || "your-google-client-secret",
      auth: {
        authorizeHost: "https://accounts.google.com",
        authorizePath: "/o/oauth2/v2/auth",
        tokenHost: "https://www.googleapis.com",
        tokenPath: "/oauth2/v4/token",
      },
      scopes: ["openid", "email", "profile"],
      redirectUri:
        process.env.OAUTH_REDIRECT_URI ||
        "http://localhost:3000/auth/google/callback",
      successRedirect:
        process.env.OAUTH_SUCCESS_REDIRECT ||
        "http://localhost:3000/auth/success",
      errorRedirect:
        process.env.OAUTH_ERROR_REDIRECT || "http://localhost:3000/auth/error",
    },
  };
};

export const validateOAuthConfig = (config) => {
  const errors = [];

  if (
    !config.google.clientId ||
    config.google.clientId === "your-google-client-id"
  ) {
    errors.push("Google Client ID is not configured");
  }

  if (
    !config.google.clientSecret ||
    config.google.clientSecret === "your-google-client-secret"
  ) {
    errors.push("Google Client Secret is not configured");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
