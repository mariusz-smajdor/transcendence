const openDatabase = require("./database");
const Password = require("../services/passwordService");
const {
  validateUserCredentials,
} = require("../services/userAuthenticationServices");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

class User {
  constructor(username, password, email) {
    this.username = username;
    this.password = password;
    this.email = email;
  }

  async register(db) {
    const isValid = validateUserCredentials(
      this.username,
      this.password,
      this.email
    );

    if (!isValid.success) {
      return { success: false, message: isValid.message, code: 400 };
    }

    try {
      const hashedPassword = await Password.hashPassword(this.password);
      const secret = speakeasy.generateSecret({
        name: `Transcendence:${this.username}`,
      });

      db.prepare(
        `INSERT INTO users (username, password, email, totp_secret) VALUES (?, ?, ?, ?)`
      ).run(this.username, hashedPassword, this.email, secret.base32);

      return {
        success: true,
        message: "User registered successfully",
        qrCode: await QRCode.toDataURL(secret.otpauth_url),
        secret: secret.base32,
        code: 200,
      };
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return {
          success: false,
          message: "Username already exists",
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
        return { success: false, message: "User not found", code: 404 };
      } else {
        const isPasswordValid = await Password.comparePassword(
          this.password,
          user.password
        );

        if (!isPasswordValid) {
          return {
            success: false,
            message: "Invalid password",
            code: 401,
          };
        }

        return {
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
          code: 200,
        };
      }
    } catch (err) {
      return {
        success: false,
        message: "Internal server error",
        code: 500,
      };
    }
  }
}

module.exports = User;
