import { getMatchResults, getMatchStats } from '../models/gameHistory.js';

export const getMatchResultsHandler = async (req, res) => {
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

    const result = await getMatchResults(db, userId);

    if (!result.success) {
      return res.status(500).send({ success: false, message: result.error });
    }

    return res.status(200).send({
      success: true,
      matches: result.matches,
    });
  } catch (err) {
    console.error('Error fetching match results:', err);
    return res.status(400).send({ success: false, message: 'Invalid token' });
  }
};

export const getMatchStatsHandler = async (req, res) => {
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

    const result = await getMatchStats(db, userId);

    if (!result.success) {
      return res.status(500).send({ success: false, message: result.error });
    }

    return res.status(200).send({
      success: true,
      stats: result.stats,
    });
  } catch (err) {
    console.error('Error fetching match stats:', err);
    return res.status(400).send({ success: false, message: 'Invalid token' });
  }
};

export const getFriendMatchHistoryHandler = async (req, res) => {
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
    const currentUserId = decoded.userId;
    const friendId = parseInt(req.params.friendId, 10);
    const db = req.context.config.db;

    console.log('Friend match history request:', {
      currentUserId,
      friendId,
      friendIdType: typeof friendId,
    });

    if (isNaN(friendId)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid friend ID',
      });
    }

    // Verify that the friend exists and is actually a friend
    const friendCheck = db
      .prepare(
        `
      SELECT u.id, u.username, u.email, u.avatar 
      FROM users u
      JOIN friends f ON (f.user_id_1 = ? AND f.user_id_2 = u.id) OR (f.user_id_2 = ? AND f.user_id_1 = u.id)
      WHERE u.id = ?
    `,
      )
      .get(currentUserId, currentUserId, friendId);

    console.log('Friend check result:', friendCheck);

    if (!friendCheck) {
      return res.status(404).send({
        success: false,
        message: 'Friend not found or not a friend',
      });
    }

    // Get friend's match history
    console.log('Fetching match results for friend:', friendId);
    const result = await getMatchResults(db, friendId);
    console.log('Match results:', result);

    if (!result.success) {
      console.error('Failed to get match results:', result.error);
      return res.status(500).send({ success: false, message: result.error });
    }

    // Get friend's match stats
    console.log('Fetching match stats for friend:', friendId);
    const statsResult = await getMatchStats(db, friendId);
    console.log('Match stats:', statsResult);

    const responseData = {
      success: true,
      friend: {
        id: friendCheck.id,
        username: friendCheck.username,
        email: friendCheck.email,
        avatar: friendCheck.avatar,
      },
      matches: result.matches,
      stats: statsResult.success ? statsResult.stats : null,
    };

    console.log('Sending response:', JSON.stringify(responseData, null, 2));

    return res.status(200).send(responseData);
  } catch (err) {
    console.error('Error fetching friend match history:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).send({ success: false, message: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ success: false, message: 'Token expired' });
    }

    return res.status(500).send({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};

export const getDebugFriendsHandler = async (req, res) => {
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
    const currentUserId = decoded.userId;
    const db = req.context.config.db;

    // Get all friends for the current user
    const friends = db
      .prepare(
        `
      SELECT u.id, u.username, u.email, u.avatar
      FROM users u
      JOIN friends f ON (f.user_id_1 = ? AND f.user_id_2 = u.id) OR (f.user_id_2 = ? AND f.user_id_1 = u.id)
    `,
      )
      .all(currentUserId, currentUserId);

    // Get all users for debugging
    const allUsers = db.prepare('SELECT id, username, email FROM users').all();

    return res.status(200).send({
      success: true,
      currentUserId,
      friends,
      allUsers,
    });
  } catch (err) {
    console.error('Error in debug friends:', err);
    return res.status(500).send({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};
