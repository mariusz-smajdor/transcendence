import { Tournaments } from '../tournament/tournaments.js';
import { clients, notAuthenticated } from './invitations.js';
import { extractId, getAvatar } from '../tournament/utils.js';
import { tournamentGame } from '../tournament/tournamentGame.js';

export const tournaments = new Tournaments();

export async function tournamentRoutes(fastify) {
  //check for available tournamets or open the current tournament
  fastify.post('/tournament/rooms', async (req, res) => {
    try {
      let { token, sessionId } = req.body;
      let userRoom = tournaments.userTournament(sessionId, token);
      let rooms;
      if (userRoom) {
        rooms = {
          found: true,
          id: userRoom.id,
          avatar: userRoom.avatar,
          creator: userRoom.creator,
          playersIn: userRoom.players.length,
          playersExpected: userRoom.getExpectedPlayers(),
          matches: userRoom.getMatches(),
          positions: userRoom.positions(),
          playersStatus: userRoom.getPlayerStatus(),
        };
      } else {
        rooms = Array.from(tournaments.rooms.values()).map((room) => ({
          found: false,
          id: room.id,
          avatar: room.avatar,
          creator: room.creator,
          playersIn: room.players.length,
          playersExpected: room.getExpectedPlayers(),
        }));
      }
      res.code(200).send(rooms);
    } catch (err) {
      res.code(400).send({ error: `${err}` });
    }
  });

  //create tournament room
  fastify.post('/tournament/create', async (req, res) => {
    const { creator, token, sessionId, numberOfPlayers } = req.body;
    const connection = getWs(fastify, sessionId, token, res);

    if (!connection) return;
    if (tournaments.userTournament(sessionId, token)) {
      res.code(400).send({ error: 'Player is already in another tournament' });
      return;
    }
    const avatar = getAvatar(fastify, extractId(fastify, token));
    let roomId = tournaments.createRoom(
      connection,
      creator,
      avatar,
      numberOfPlayers,
      token,
      sessionId,
    );
    res.code(200).send({
      id: roomId,
      creator: creator,
      avatar: tournaments.rooms.get(roomId).avatar,
      playersIn: 1,
      playersExpected: numberOfPlayers,
      positions: tournaments.rooms.get(roomId).positions(),
      playersStatus: tournaments.rooms.get(roomId).getPlayerStatus(),
    });
  });

  fastify.post('/tournament/join', async (req, res) => {
    const { name, token, sessionId, roomId } = req.body;
    let connection = getWs(fastify, sessionId, token, res);

    if (tournaments.userTournament(sessionId, token)) {
      res.code(400).send({ error: 'Player is already in another tournament' });
      return;
    }
    let room = tournaments.getRoom(roomId);
    if (
      room === undefined ||
      room.players.length === room.getExpectedPlayers()
    ) {
      res.code(400).send({ error: 'Room is full' });
      return;
    }
    room = tournaments.joinRoom(roomId, connection, name, token, sessionId);

    // Always send consistent data format regardless of tournament status
    res.code(200).send({
      id: roomId,
      creator: room.creator,
      playersIn: room.players.length,
      playersExpected: room.getExpectedPlayers(),
      positions: room.positions(), // Use consistent positions method
      playersStatus: room.getPlayerStatus(),
    });
  });

  // fastify.get('/tournament/start', async (req, res) => {
  // 	const { roomId } = req.query;
  // 	let room = tournaments.getRoom(roomId);
  // 	if (room === undefined)
  // 		res.code(400).send({error: "Error: Cannot find tournament with this id"});
  // 	if (room.playersExpected.size != room.playersIn.length)
  // 		res.code(400).send({error: "Error: Wrong amount of players"});
  // 	room.createMatches();
  // 	res.code(200).send({success: true});
  // });

  fastify.post('/tournament/leave', async (req, res) => {
    const { roomId, token, sessionId } = req.body;
    if (!token && !sessionId) {
      res.code(400).send({ error: 'Error: Missing token and sessionId' });
      return;
    }
    let room = tournaments.getRoom(roomId);
    if (room === undefined) {
      res
        .code(400)
        .send({ error: 'Error: Cannot find tournament with this id' });
      return;
    }
    if (!tournaments.playerLeave(room, token, sessionId)) {
      res
        .code(400)
        .send({ error: 'Error: Player is not a member of this room' });
      return;
    }
    res.code(200).send({ success: 'Succesfully left the room' });
  });

  fastify.post('/tournament/play', async (req, res) => {
    const { roomId, token, sessionId } = req.body;
    if (!token && !sessionId) {
      res.code(400).send({ error: 'Error: Missing token and sessionId' });
      return;
    }

    const room = tournaments.getRoom(roomId);
    if (room === undefined) {
      res
        .code(400)
        .send({ error: 'Error: Cannot find tournament with this id' });
      return;
    }
    const gameId = room.getMatchToPlay(token, sessionId);
    if (!gameId) {
      res.code(400).send({ error: 'Error: No match available yet' });
      return;
    }
    res.code(200).send({ gameId: gameId });
  });

  fastify.get('/tournament/match', { websocket: true }, (connection, req) => {
    const { gameId, roomId } = req.query;

    // console.log(gameId);
    // console.log(roomId);
    const room = tournaments.getRoom(roomId);
    if (room === undefined) {
      connection.send(JSON.stringify({ error: 'Room not found' }));
      console.log('Room not found');
      connection.close();
      return;
    }
    const match = room.matches.get(gameId);
    if (match === undefined) {
      connection.send(JSON.stringify({ error: 'Match not found' }));
      console.log('Match not found');
      connection.close();
      return;
    }
    //connection.send(JSON.stringify({ success: 'Match found' }));
    try {
      tournamentGame(fastify, connection, match.game, match, room);
    } catch (err) {
      console.error('Error in tournamentGame:', err);
    }
  });
}

function getWs(fastify, sessionId, token, res) {
  if (!token && !sessionId) {
    res
      .code(400)
      .send({ error: 'Missing token or sessionId. Cannot identify user.' });
    return null;
  }
  let connection;
  try {
    connection = token
      ? clients.get(getId(fastify, token))
      : notAuthenticated.get(sessionId);
  } catch (err) {
    console.log(err);
    if (!sessionId) {
      res.code(400).send({ error: 'Wrong token. Cannot identify user.' });
      return null;
    }
    connection = notAuthenticated.get(sessionId);
  }
  if (connection === undefined) {
    res
      .code(400)
      .send({ error: 'Wrong token or sessionId. Cannot identify user.' });
    return null;
  }
  return connection;
}

function getId(fastify, token) {
  const decoded = fastify.jwt.verify(token);
  return decoded.userId;
}

/*
curl -X POST http://localhost:3000/tournament/create   -H "Content-Type: application/json"   -d '{
    "creator": "filip",
    "token": "",
    "sessionId": null,
    "numberOfPlayers": 8
  }'
*/
