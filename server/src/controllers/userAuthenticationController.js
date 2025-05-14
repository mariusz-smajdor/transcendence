import User from '../models/userModel.js';
import { sendResponse } from '../utils/response.js';

export const registrationHandler = async (req, res) => {
  const { username, password, email, avatar } = req.body;

  const user = new User(username, password, email, avatar);

  const { message, code, qrCode, secret } = await user.register(
    req.context.config.db,
  );

  return sendResponse(res, code, message, { qrCode, secret });
};

export const loginHandler = async (req, res) => {
  const { username, password, totpToken } = req.body;

  const userData = new User(username, password);
  const { message, user, code } = await userData.login(
    req.context.config.db,
    totpToken,
  );

  if (code >= 400) return sendResponse(res, code, message);

  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  };
  const token = req.jwt.sign(payload, { expiresIn: '1h' });
  res.setCookie('access_token', token, {
    path: '/',
    httpOnly: false,
    secure: false,
  });
  return sendResponse(res, code, message, user);
};

export const logoutHandler = async (req, res) => {
  const db = req.context.config.db;

  const token = req.cookies?.access_token;

  if (!token) {
    return sendResponse(res, 400, 'No token provided in cookies');
  }

  try {
    const decoded = req.server.jwt.decode(token);

    if (!decoded || !decoded.exp) {
      return sendResponse(res, 400, 'Invalid token');
    }

    const expiresAt = decoded.exp * 1000;

    const stmt = db.prepare(
      'INSERT OR IGNORE INTO blacklisted_tokens (token, expires_at) VALUES (?, ?)',
    );
    stmt.run(token, expiresAt);

    res.clearCookie('access_token', {
      httpOnly: false, // Change to true in production
      secure: false, // Change to true if using HTTPS
      sameSite: 'Strict',
    });

    return sendResponse(res, 200, 'Logged out successfully');
  } catch (err) {
    console.error('Logout error:', err);
    return sendResponse(res, 500, 'Internal server error');
  }
};

export const meHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) return sendResponse(res, 400, 'No token provided');

  let decoded;
  try {
    decoded = req.server.jwt.verify(token);
  } catch (err) {
    return sendResponse(res, 400, 'Invalid token');
  }

  const userId = decoded.userId;
  const db = req.context.config.db;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return sendResponse(res, 404, 'User not found');

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  };

  return sendResponse(res, 200, 'User data retrieved successfully!', payload);
};
