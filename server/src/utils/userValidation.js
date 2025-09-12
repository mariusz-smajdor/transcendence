export const validateRegistrationData = (username, password) => {
  const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push("Username is required");
  } else if (username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  } else if (username.length > 50) {
    errors.push("Username must be less than 50 characters");
  }

  if (!password || password.length === 0) {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLoginData = (username, password) => {
  const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push("Username is required");
  }

  if (!password || password.length === 0) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
