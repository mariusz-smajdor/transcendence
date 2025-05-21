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

  if (!token) {
    return res.send({
      success: false,
      message: 'No token provided',
    });
  }

  let decoded;
  try {
    decoded = req.server.jwt.verify(token);
  } catch (err) {
    return res.send({
      success: false,
      message: 'Invalid token',
    });
  }

  const userId = decoded.userId;
  const db = req.context.config.db;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.send({
      success: false,
      message: 'User not found',
    });
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  };

  return res.send({
    success: true,
    message: 'User data retrieved successfully!',
    ...payload,
  });
};

export const getFriendsHandler = async (req, res) => {
  const token = req.cookies?.access_token;
  let decoded;

  try {
    decoded = req.server.jwt.verify(token);
  } catch (err) {
    return res.send({
      success: false,
      message: 'Invalid token',
    });
  }

  const userId = decoded?.userId;
  const db = req.context.config.db;

  try {
    const friends = db
      .prepare(
        `
        SELECT u.id, u.username, u.avatar
        FROM friends f
        JOIN users u ON 
          (u.id = f.user_id_1 AND f.user_id_2 = ?)
          OR 
          (u.id = f.user_id_2 AND f.user_id_1 = ?)
        `,
      )
      .all(userId, userId);

    return res.send({
      success: true,
      friends,
    });
  } catch (err) {
    console.error('DB error:', err);
    return res.send({
      success: false,
      message: 'Database error',
    });
  }
};

export const sendFriendRequestHandler = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    const decoded = req.server.jwt.decode(token);
    const senderId = decoded?.userId;
    if (!senderId) {
      return sendResponse(res, 401, 'Unauthorized: Try to login again');
    }

    const { username: receiverUsername } = req.body;
    if (!receiverUsername) {
      return sendResponse(res, 400, 'Bad request: Friend username is empty');
    }

    const db = req.context.config.db;

    // Get receiver id by username
    const receiver = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(receiverUsername);

    if (!receiver) {
      return sendResponse(res, 404, `User ${receiverUsername} doesn't exist`);
    }
    if (receiver.id === senderId) {
      return sendResponse(res, 400, "You can't friend yourself");
    }

    // Check if they are already friends (either direction)
    const alreadyFriends = db
      .prepare(
        `SELECT 1 FROM friends WHERE 
         (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)`,
      )
      .get(senderId, receiver.id, receiver.id, senderId);

    if (alreadyFriends) {
      return sendResponse(res, 409, 'User is already your friend');
    }

    // Check if a friend request already exists (either direction)
    const existingRequest = db
      .prepare(
        `SELECT id FROM friend_requests WHERE 
         (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
      )
      .get(senderId, receiver.id, receiver.id, senderId);

    if (existingRequest) {
      return sendResponse(res, 409, 'Friend request already exists');
    }

    // Insert friend request
    try {
      db.prepare(
        `INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)`,
      ).run(senderId, receiver.id);
    } catch (err) {
      return sendResponse(res, 500, `Insert failed: ${err.message}`);
    }

    return sendResponse(res, 200, 'Friend request sent');
  } catch (error) {
    return sendResponse(res, 500, 'Internal server error');
  }
};

export const getFriendRequestsHandler = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.send({ success: false, message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = req.server.jwt.verify(token);
    } catch (err) {
      return res.send({ success: false, message: 'Invalid token' });
    }

    const userId = decoded?.userId;
    if (!userId) {
      return res.send({ success: false, message: 'Unauthorized' });
    }

    const db = req.context.config.db;

    let requests;
    try {
      requests = db
        .prepare(
          `
            SELECT 
              fr.id AS requestId,
              u.id AS senderId,
              u.username AS senderUsername,
              u.avatar AS senderAvatar
            FROM friend_requests fr
            JOIN users u ON u.id = fr.sender_id
            WHERE fr.receiver_id = ?
          `,
        )
        .all(userId);
    } catch (dbError) {
      return res.send({ success: false, message: 'Database error' });
    }

    return res.send({
      success: true,
      requests,
    });
  } catch (error) {
    return res.send({ success: false, message: 'Internal server error' });
  }
};

export const acceptFriendRequestHandler = async (req, res) => {
  const token = req.cookies?.access_token;
  const decoded = req.server.jwt.decode(token);
  const receiverId = decoded?.userId;

  if (!receiverId) {
    return sendResponse(res, 401, 'Unauthorized');
  }

  const { requestId: senderId } = req.body;
  if (!senderId) {
    return sendResponse(res, 400, 'Missing senderId');
  }

  const db = req.context.config.db;

  const request = db
    .prepare(
      'SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ?',
    )
    .get(senderId, receiverId);

  if (!request) {
    return sendResponse(res, 404, 'Friend request not found or unauthorized');
  }

  try {
    const insert = db.prepare(
      `INSERT INTO friends (user_id_1, user_id_2) VALUES (?, ?)`,
    );
    insert.run(senderId, receiverId);

    db.prepare('DELETE FROM friend_requests WHERE id = ?').run(request.id);

    return sendResponse(res, 200, 'Friend request accepted');
  } catch (err) {
    return sendResponse(res, 500, `Database error: ${err.message}`);
  }
};

export const rejectFriendRequestHandler = async (req, res) => {
  const token = req.cookies?.access_token;
  const decoded = req.server.jwt.decode(token);
  const receiverId = decoded?.userId;

  if (!receiverId) {
    return sendResponse(res, 401, 'Unauthorized');
  }

  const { requestId: senderId } = req.body;
  if (!senderId) {
    return sendResponse(res, 400, 'Missing senderId');
  }

  const db = req.context.config.db;

  const request = db
    .prepare(
      'SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ?',
    )
    .get(senderId, receiverId);

  if (!request) {
    return sendResponse(res, 404, 'Friend request not found or unauthorized');
  }

  try {
    db.prepare('DELETE FROM friend_requests WHERE id = ?').run(request.id);
    return sendResponse(res, 200, 'Friend request rejected');
  } catch (err) {
    return sendResponse(res, 500, `Database error: ${err.message}`);
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const db = req.context.config.db;
    const fastify = req.context.config.fastify;

    // 1. Exchange code for Google tokens
    const { token } =
      await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
        req,
        res,
      );

    // 2. Fetch Google profile
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
      },
    );
    const userInfo = await userInfoResponse.json();

    // 3. Upsert user in your DB
    const email = userInfo.email;
    const username = email.split('@')[0];
    const existingUser = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);

    let userResult;
    if (!existingUser) {
      const user = new User(username, null, email);
      userResult = await user.register(db);
    } else {
      const user = new User(existingUser.username, null, email);
      userResult = await user.login(db);
    }
    if (!userResult.success) {
      return res.code(userResult.code).send({ error: userResult.message });
    }

    // 4. Sign a JWT and set it as a cookie
    const payload = {
      userId: userResult.user.id,
      username: userResult.user.username,
      email: userResult.user.email,
      avatar: userResult.user.avatar,
    };
    const jwtToken = req.jwt.sign(payload, { expiresIn: '1h' });

    res
      .setCookie('access_token', jwtToken, {
        path: '/',
        httpOnly: false, // flip to `true` in prod
        secure: false, // flip to `true` if you're on HTTPS
        maxAge: 3600, // 1 hour in seconds
      })
      // 5. Redirect back to your front-end
      .redirect('http://localhost:8080');
  } catch (err) {
    console.error(err);
    return res.code(500).send({ error: 'Internal server error' });
  }
};
