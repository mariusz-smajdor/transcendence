import Password from '../services/passwordService.js';

class User {
  constructor(username, password, email, avatar = null) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.avatar = avatar;
  }

  async register(db) {
    if (this.password) {
      const isValid = authService.validateUserCredentials(
        this.username,
        this.password,
        this.email,
      );
      if (!isValid.success) {
        return { success: false, message: isValid.message, code: 400 };
      }
    }

    try {
      let hashedPassword = null;
      if (this.password) {
        hashedPassword = await Password.hashPassword(this.password);
      }

      db.prepare(
        `INSERT INTO users (username, password, email, avatar) VALUES (?, ?, ?, ?)`,
      ).run(this.username, hashedPassword || 'google', this.email, this.avatar);

      const createdUser = db
        .prepare(`SELECT * FROM users WHERE username = ?`)
        .get(this.username);
      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
        },
        code: 200,
      };
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return {
          success: false,
          message: 'Username already exists',
          code: 400,
        };
      }
      return { success: false, message: err.message, code: 500 };
    }
  }

  async login(db) {
    try {
      const user = db
        .prepare(`SELECT * FROM users WHERE username = ?`)
        .get(this.username);

      if (!user) {
        return { success: false, message: 'User not found', code: 404 };
      }

      // Verify password if set
      if (user.password && this.password !== null) {
        const isPasswordValid = await Password.comparePassword(
          this.password,
          user.password,
        );

        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Invalid password',
            code: 401,
          };
        }
      }

      // Login successful without requiring TOTP
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        code: 200,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Internal server error',
        code: 500,
      };
    }
  }
}

export default User;
