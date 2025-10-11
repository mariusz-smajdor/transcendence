import { setPlayerStats } from '../game/authentication.js';

export function extractId(fastify, token) {
  if (!token) return null;
  try {
    const decoded = fastify.jwt.verify(token);
    console.log(decoded.userId);
    return decoded.userId;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function getAvatar(fastify, id) {
  if (id === null) return null;
  const response = fastify.db
    .prepare(`SELECT avatar FROM users WHERE id = ?`)
    .get(id);
  return response.avatar;
}

export function authenticatePlayer(game, connection, fastify, msg, match) {
  let payload;
  if (game.playersManager.authenticated.has(connection)) return;
  if (msg.type === 'auth' && msg.token) {
    try {
      payload = fastify.jwt.verify(msg.token);
      if (
        game.playersManager.leftPlayer &&
        game.playersManager.rightPlayer &&
        match.save === null
      ) {
        match.save = true;
      }
    } catch (err) {
      console.log("The result of the game won't be saved to database");
      match.save = false;
      return;
    }
  } else {
    console.log("The result of the game won't be saved to database");
    match.save = false;
    return;
  }
  setPlayerStats(game, connection, msg, payload);
}
