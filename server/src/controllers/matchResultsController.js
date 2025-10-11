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
