function validateUsername(username) {
  return username.length >= 3 && username.length <= 20;
}

function validatePassword(password) {
  return password.length >= 8 && /^[A-Za-z0-9]+$/.test(password);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

class AuthService {
  validateUserCredentials(username, password, email) {
    if (!AuthService.validateUsername(username)) {
      return {
        success: false,
        message: 'Malformed username',
      };
    }

    if (!AuthService.validatePassword(password)) {
      return {
        success: false,
        message: 'Malformed password',
      };
    }

    if (!AuthService.validateEmail(email)) {
      return {
        success: false,
        message: 'Malformed email',
      };
    }

    return { success: true, message: 'Valid credentials' };
  }
}

export default new AuthService();
