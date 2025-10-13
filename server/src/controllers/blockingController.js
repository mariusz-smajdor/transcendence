import {
  blockUser,
  unblockUser,
  getBlockedUsers,
} from '../services/blockingService.js';

export const blockUserHandler = async (req, res) => {
  const db = req.context.config.db;
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res
      .status(401)
      .send({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = req.server.jwt.verify(token);
    const blockerId = decoded.userId;
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .send({ success: false, message: 'User ID is required' });
    }

    const result = await blockUser(db, blockerId, userId);

    if (result.success) {
      return res.status(200).send({ success: true, message: result.message });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in blockUserHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};

export const unblockUserHandler = async (req, res) => {
  const db = req.context.config.db;
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res
      .status(401)
      .send({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = req.server.jwt.verify(token);
    const blockerId = decoded.userId;
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .send({ success: false, message: 'User ID is required' });
    }

    const result = await unblockUser(db, blockerId, userId);

    if (result.success) {
      return res.status(200).send({ success: true, message: result.message });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in unblockUserHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};

export const getBlockedUsersHandler = async (req, res) => {
  const db = req.context.config.db;
  const authHeader = req.headers.authorization;
  let token = authHeader?.split(' ')[1];

  if (!token && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res
      .status(401)
      .send({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = req.server.jwt.verify(token);
    const userId = decoded.userId;

    const result = await getBlockedUsers(db, userId);

    if (result.success) {
      return res
        .status(200)
        .send({ success: true, blockedUsers: result.blockedUsers });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in getBlockedUsersHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};
