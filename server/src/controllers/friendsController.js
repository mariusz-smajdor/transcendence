import {
  getFriendsList,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '../services/friendsServices.js';

export const getFriendsHandler = async (req, res) => {
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

    const result = await getFriendsList(db, userId);

    if (result.success) {
      return res.status(200).send({ success: true, friends: result.friends });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in getFriendsHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};

export const sendFriendRequestHandler = async (req, res) => {
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
    const senderId = decoded.userId;
    const { username } = req.body;

    if (!username) {
      return res
        .status(400)
        .send({ success: false, message: 'Username is required' });
    }

    const result = await sendFriendRequest(db, senderId, username);

    if (result.success) {
      return res.status(200).send({ success: true, message: result.message });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in sendFriendRequestHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};

export const getFriendRequestsHandler = async (req, res) => {
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

    const result = await getFriendRequests(db, userId);

    if (result.success) {
      return res.status(200).send({ success: true, requests: result.requests });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in getFriendRequestsHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};

export const acceptFriendRequestHandler = async (req, res) => {
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
    const { requestId } = req.body;

    if (!requestId) {
      return res
        .status(400)
        .send({ success: false, message: 'Request ID is required' });
    }

    const result = await acceptFriendRequest(db, requestId, userId);

    if (result.success) {
      return res.status(200).send({ success: true, message: result.message });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in acceptFriendRequestHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};

export const rejectFriendRequestHandler = async (req, res) => {
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
    const { requestId } = req.body;

    if (!requestId) {
      return res
        .status(400)
        .send({ success: false, message: 'Request ID is required' });
    }

    const result = await rejectFriendRequest(db, requestId, userId);

    if (result.success) {
      return res.status(200).send({ success: true, message: result.message });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in rejectFriendRequestHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};

export const removeFriendHandler = async (req, res) => {
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
    const { friendId } = req.body;

    if (!friendId) {
      return res
        .status(400)
        .send({ success: false, message: 'Friend ID is required' });
    }

    if (userId === friendId) {
      return res.status(400).send({
        success: false,
        message: 'Cannot remove yourself as a friend',
      });
    }

    const result = await removeFriend(db, userId, friendId);

    if (result.success) {
      return res.status(200).send({ success: true, message: result.message });
    } else {
      return res.status(400).send({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error in removeFriendHandler:', error);
    return res.status(401).send({ success: false, message: 'Invalid token' });
  }
};
