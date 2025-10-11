import {
  sendMessage,
  getMessages,
  getConversations,
  markMessagesAsRead,
} from '../services/messagesService.js';

export const sendMessageHandler = async (req, res) => {
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

  const senderId = decoded.userId;
  const { receiverId, message } = req.body;

  if (!receiverId || !message) {
    return res.status(400).send({
      success: false,
      message: 'Receiver ID and message are required',
    });
  }

  if (senderId === receiverId) {
    return res.status(400).send({
      success: false,
      message: 'Cannot send message to yourself',
    });
  }

  const db = req.context.config.db;
  const result = await sendMessage(db, senderId, receiverId, message);

  return res.status(result.success ? 200 : 400).send(result);
};

export const getMessagesHandler = async (req, res) => {
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
  const { otherUserId } = req.query;

  if (!otherUserId) {
    return res.status(400).send({
      success: false,
      message: 'Other user ID is required',
    });
  }

  const db = req.context.config.db;
  const result = await getMessages(db, userId, otherUserId);

  return res.status(result.success ? 200 : 400).send(result);
};

export const getConversationsHandler = async (req, res) => {
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
  const result = await getConversations(db, userId);

  return res.status(result.success ? 200 : 400).send(result);
};

export const markAsReadHandler = async (req, res) => {
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
  const { otherUserId } = req.body;

  if (!otherUserId) {
    return res.status(400).send({
      success: false,
      message: 'Other user ID is required',
    });
  }

  const db = req.context.config.db;
  const result = await markMessagesAsRead(db, userId, otherUserId);

  return res.status(result.success ? 200 : 400).send(result);
};
