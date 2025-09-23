import { v4 as uuidv4 } from 'uuid';
import { tournaments } from './tournament.js';

export const clients = new Map();
export const notAuthenticated = new Map();

export async function invitations(fastify) {
  fastify.get('/invitations', { websocket: true }, (connection, req) => {
    let authenticated = false;
    let userId = null;
    let sessionId = null;
    let token = null;

    connection.on('message', (message) => {
      //console.log('open');
      let data;
      try {
        data = JSON.parse(message);
        //console.log(data);
      } catch {
        console.log('JSON expected');
        //sending message?
        connection.close();
        return;
      }

      if (data.type === 'auth') {
        try {
          const decoded = fastify.jwt.verify(
            data.token,
            process.env.JWT_SECRET,
          );
          userId = decoded.userId;
          authenticated = true;
          console.log(`User ${userId} has been authorized`);
          token = data.token;
        } catch (err) {
          console.log(`User has not been authorized.`);
        }

        if (!authenticated) {
          if (!data.sessionId) sessionId = uuidv4();
          else sessionId = data.sessionId;
        }
        connection.send(
          JSON.stringify({ type: 'cookies', token: data.token, sessionId }),
        );

        if (scanWs(sessionId || userId)) {
          tournaments.switchWs(sessionId, data.token, userId, connection);
        } else {
          if (userId) clients.set(userId, connection);
          else notAuthenticated.set(sessionId, connection);
        }
        return;
      }

      if (!authenticated) {
        return;
      }

      if (data.type === 'invite' && data.toUserId) {
        const target = clients.get(data.toUserId);
        if (target) {
          target.send(
            JSON.stringify({
              type: 'invite',
              fromUserId: userId,
              message: data.message,
            }),
          );
        }
      }

      if (data.type === 'uninvite' && data.toUserId) {
        const target = clients.get(data.toUserId);
        if (target) {
          target.send(
            JSON.stringify({
              type: 'uninvite',
              fromUserId: userId,
              message: data.message,
            }),
          );
        }
      }

      if (data.type === 'accept' && data.toUserId) {
        const target = clients.get(data.toUserId);
        if (target) {
          target.send(
            JSON.stringify({
              type: 'game_start',
              fromUserId: userId,
              message: data.message,
            }),
          );
        }
      }

      if (data.type === 'game_start') {
        console.log('Received game_start');
        const target = clients.get(data.toUserId);
        if (target) {
          target.send(
            JSON.stringify({
              type: 'game_start_with_id',
              fromUserId: userId,
              message: data.message,
              gameId: data.gameId,
            }),
          );
          console.log('Sent task to open an overlay with game');
        }
      }
    });

    connection.on('close', () => {
      //console.log("close")
      let room = tournaments.userTournament(sessionId, token);
      if (room) {
        const player = room.getPlayer(sessionId, token);
        if (player.connection === connection)
          tournaments.playerLeave(room, token, sessionId);
      }
      if (userId) {
        if (clients.get(userId) === connection) clients.delete(userId);
      } else {
        if (notAuthenticated.get(sessionId) === connection)
          notAuthenticated.delete(sessionId);
      }
    });

    connection.on('error', () => {
      //console.log("close")
      let room = tournaments.userTournament(sessionId, token);
      if (room) {
        const player = room.getPlayer(sessionId, token);
        if (player.connection === connection)
          tournaments.playerLeave(room, token, sessionId);
      }
      if (userId) {
        if (clients.get(userId) === connection) clients.delete(userId);
      } else {
        if (notAuthenticated.get(sessionId) === connection)
          notAuthenticated.delete(sessionId);
      }
    });
  });
}

function scanWs(key) {
  if (clients.get(key)) return true;
  else if (notAuthenticated.get(key)) return true;
  return false;
}

export function closeOldWs(key) {
  let oldWs = clients.get(key);
  if (!oldWs) oldWs = notAuthenticated.get(key);
  wsMessage(
    'Connection closed! Please close this tab and continue in your new one.',
    oldWs,
  );
  oldWs.close();
}

export function closeCurrentWs(connection) {
  wsMessage(
    'Connection closed! Please close this tab and continue in previous one.',
    connection,
  );
  connection.close();
}

export function wsMessage(message, connection) {
  connection.send(JSON.stringify({ type: 'message', message }));
}

export function addNewConnection(sessionId, userId, connection) {
  //console.log(`add ${connection}`)
  if (userId) clients.set(userId, connection);
  else notAuthenticated.set(sessionId, connection);
}
