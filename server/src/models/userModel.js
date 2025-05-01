import Password from '../services/passwordService.js';
import { validateUserCredentials } from '../services/userAuthenticationServices.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
class User {
  constructor(username, password, email, avatar = null) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.avatar = avatar;
  }

  async register(db) {
    const isValid = validateUserCredentials(
      this.username,
      this.password,
      this.email,
    );

    if (isValid) {
      return { message: isValid, code: 400 };
    }

    try {
      const hashedPassword = await Password.hashPassword(this.password);
      const secret = speakeasy.generateSecret({
        name: `Transcendence:${this.username}`,
      });

      db.prepare(
        `INSERT INTO users (username, password, email, totp_secret, avatar) VALUES (?, ?, ?, ?, ?)`,
      ).run(
        this.username,
        hashedPassword,
        this.email,
        secret.base32,
        this.avatar,
      );

      return {
        message: 'User registered successfully',
        qrCode: await QRCode.toDataURL(secret.otpauth_url),
        secret: secret.base32,
        code: 200,
      };
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return {
          message: 'Username already exists',
          code: 400,
        };
      }
      return { message: err.message, code: 500 };
    }
  }

  async login(db, totpToken = null) {
    try {
      const user = db
        .prepare(`SELECT * FROM users WHERE username = ?`)
        .get(this.username);

      if (!user) {
        return { success: false, message: 'User not found', code: 404 };
      }

      const isPasswordValid = await Password.comparePassword(
        this.password,
        user.password,
      );

      if (!isPasswordValid) {
        return {
          message: 'Invalid password',
          code: 401,
        };
      }

      // // Check if 2FA is enabled (totp_secret exists)
      // if (user.totp_secret) {
      //   if (!totpToken) {
      //     // 2FA is required but no token provided
      //     return {
      //       success: false,
      //       message: '2FA token required',
      //       requires2FA: true,
      //       user: {
      //         id: user.id,
      //         username: user.username,
      //         email: user.email,
      //       },
      //       code: 401,
      //     };
      //   }

      //   // Verify TOTP token
      //   const isTotpValid = speakeasy.totp.verify({
      //     secret: user.totp_secret,
      //     encoding: 'base32',
      //     token: totpToken,
      //   });

      //   if (!isTotpValid) {
      //     return {
      //       success: false,
      //       message: 'Invalid 2FA token',
      //       code: 401,
      //     };
      //   }
      // }

      // Login successful (either no 2FA or 2FA verified)
      return {
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        code: 200,
      };
    } catch (err) {
      return {
        message: 'Internal server error',
        code: 500,
      };
    }
  }
}

export default User;
