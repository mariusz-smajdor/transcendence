import User from '../models/userModel.js';

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
  const userData = new User(username, password);

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
  };

  return res.status(200).send({ payload });
};
