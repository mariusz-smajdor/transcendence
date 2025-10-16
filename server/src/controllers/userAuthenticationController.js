import User from '../models/userModel.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { deleteAvatarFile } from '../utils/avatarCleanup.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { parseDbError } from '../utils/dbErrorHandler.js';

export const registrationHandler = async (req, res) => {
  const { username, password, confirmPassword, email } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send({
      success: false,
      message: 'Passwords do not match',
    });
  }

  const user = new User(username, password, email);

  const { success, message, code, qrCode, secret } = await user.register(
    req.context.config.db,
  );

  return res.status(code).send({ success, message, code, qrCode, secret });
};

export const loginHandler = async (req, res) => {
  const { username, password, totpToken } = req.body;
  const userData = new User(username, password, ''); // Pass empty email since we don't need it for login

  const { success, message, user, code } = await userData.login(
    req.context.config.db,
    totpToken,
  );

  if (!success) return res.status(code).send({ success, message });

  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    google_id: user.google_id || null,
  };
  const token = req.jwt.sign(payload, { expiresIn: '1h' });
  res.setCookie('access_token', token, {
    path: '/',
    httpOnly: false,
    secure: false,
  });
  return res.status(code).send({ success, message, user });
};

export const logoutHandler = async (req, res) => {
  const db = req.context.config.db;
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(400).send({ error: 'No token provided' });
  }

  try {
    const decoded = req.server.jwt.decode(token);

    if (!decoded || !decoded.exp) {
      return res.status(400).send({ error: 'Invalid token' });
    }

    const expiresAt = decoded.exp * 1000; // Convert to ms

    // Insert token into blacklist table
    const stmt = db.prepare(
      'INSERT OR IGNORE INTO blacklisted_tokens (token, expires_at) VALUES (?, ?)',
    );
    stmt.run(token, expiresAt);

    res.clearCookie('access_token', {
      httpOnly: false,
      secure: false,
      sameSite: 'Strict',
    });

    return res.send({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res
      .status(500)
      .send({ success: false, message: 'Logged out successfully' });
  }
};

export const meHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(400).send({ message: 'No token provided' });
  }

  let decoded;
  try {
    decoded = req.server.jwt.verify(token);
  } catch (err) {
    return res.status(400).send({ message: 'Invalid token' });
  }

  const userId = decoded.userId;
  const db = req.context.config.db;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(400).send({ message: 'User not found' });
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    google_id: user.google_id,
  };

  return res.status(200).send({ payload });
};

export const updateProfileHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res
      .status(400)
      .send({ success: false, message: 'No token provided' });
  }

  let decoded;
  try {
    decoded = req.server.jwt.verify(token);
  } catch (err) {
    return res.status(400).send({ success: false, message: 'Invalid token' });
  }

  const userId = decoded.userId;
  const db = req.context.config.db;

  try {
    // Get current user data to check for existing avatar and OAuth status
    const currentUser = db
      .prepare('SELECT avatar, google_id FROM users WHERE id = ?')
      .get(userId);

    const parts = req.parts();
    let updateData = {};
    let avatarPath = null;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'avatar') {
        // Delete previous avatar file if it exists and is not a Google OAuth avatar
        if (currentUser?.avatar) {
          deleteAvatarFile(currentUser.avatar);
        }

        // Handle avatar file upload
        const filename = `${userId}_${Date.now()}_${part.filename}`;
        const uploadDir = path.join(
          path.dirname(fileURLToPath(import.meta.url)),
          '..',
          '..',
          'uploads',
          'avatars',
        );

        // Create upload directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(filePath);

        await new Promise((resolve, reject) => {
          part.file.pipe(writeStream);
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        avatarPath = `https://10.12.4.4:3000/uploads/avatars/${filename}`;
        updateData.avatar = avatarPath;
      } else if (part.type === 'field') {
        // Handle text fields
        if (part.fieldname === 'username' && part.value.trim()) {
          updateData.username = part.value.trim();
        } else if (part.fieldname === 'email' && part.value.trim()) {
          updateData.email = part.value.trim();
        } else if (part.fieldname === 'password' && part.value) {
          updateData.password = part.value;
        }
      }
    }

    // Check if user is OAuth user and restrict username/password changes
    const isOAuthUser = currentUser?.google_id !== null;
    if (isOAuthUser) {
      // OAuth users can only change avatar, not username or password
      if (updateData.username) {
        return res.status(400).send({
          success: false,
          message: 'OAuth users cannot change their username',
        });
      }
      if (updateData.password) {
        return res.status(400).send({
          success: false,
          message: 'OAuth users cannot change their password',
        });
      }
    }

    // Validate username if provided
    if (updateData.username) {
      const existingUser = db
        .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
        .get(updateData.username, userId);
      if (existingUser) {
        return res
          .status(400)
          .send({ success: false, message: 'Username already taken' });
      }
    }

    // Validate email if provided
    if (updateData.email) {
      const existingUser = db
        .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
        .get(updateData.email, userId);
      if (existingUser) {
        return res
          .status(400)
          .send({ success: false, message: 'Email already taken' });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (updateData.username) {
      updateFields.push('username = ?');
      updateValues.push(updateData.username);
    }
    if (updateData.email) {
      updateFields.push('email = ?');
      updateValues.push(updateData.email);
    }
    if (updateData.avatar) {
      updateFields.push('avatar = ?');
      updateValues.push(updateData.avatar);
    }
    if (updateData.password) {
      // Hash the new password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: 'No valid fields to update' });
    }

    updateValues.push(userId);
    const updateQuery = `UPDATE users SET ${updateFields.join(
      ', ',
    )} WHERE id = ?`;

    try {
      const stmt = db.prepare(updateQuery);
      stmt.run(...updateValues);
    } catch (dbError) {
      // Handle database constraint errors
      const message = parseDbError(dbError);
      return res.status(400).send({
        success: false,
        message: message,
      });
    }

    // Get updated user data
    const updatedUser = db
      .prepare('SELECT id, username, email, avatar FROM users WHERE id = ?')
      .get(userId);

    return res.status(200).send({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res
      .status(500)
      .send({ success: false, message: 'Failed to update profile' });
  }
};

export const enable2FAHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res
      .status(400)
      .send({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = req.server.jwt.verify(token);
    const userId = decoded.userId;
    const db = req.context.config.db;

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `Transcendence:${decoded.username}`,
    });

    // Update user with new secret
    db.prepare('UPDATE users SET totp_secret = ? WHERE id = ?').run(
      secret.base32,
      userId,
    );

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return res.status(200).send({
      success: true,
      message: '2FA enabled successfully',
      qrCode,
      secret: secret.base32,
    });
  } catch (err) {
    return res.status(400).send({ success: false, message: 'Invalid token' });
  }
};

export const disable2FAHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res
      .status(400)
      .send({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = req.server.jwt.verify(token);
    const userId = decoded.userId;
    const db = req.context.config.db;

    // Remove secret from user
    db.prepare('UPDATE users SET totp_secret = NULL WHERE id = ?').run(userId);

    return res.status(200).send({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (err) {
    return res.status(400).send({ success: false, message: 'Invalid token' });
  }
};
