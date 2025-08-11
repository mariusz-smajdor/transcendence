import { Tournaments } from "../tournament/tournaments.js";
import { clients, notAuthenticated } from "./game.js";
import { extractId, getAvatar } from "../tournament/utils.js";
const tournaments = new Tournaments();

export async function tournamentRoutes(fastify){
	//check for available tournamnets or open the current tournament
	fastify.post('/tournament/rooms', async (req, res) => {
		try{
			let {token , sessionId} = req.body;
			let userRoom = tournaments.userTournament(sessionId,token);
			let rooms;
			if (userRoom){
				rooms = {
					found: true,
					id: userRoom.id,
					avatar: userRoom.avatar,
					creator: userRoom.creator,
					playersIn: userRoom.players.length,
					playersExpected: userRoom.getExpectedPlayers()};
			} 
			else {
				rooms = Array.from(tournaments.rooms.values()).map(room => ({
					found: false,
					id: room.id,
					avatar: room.avatar,
					creator: room.creator,
					playersIn: room.players.length,
					playersExpected: room.getExpectedPlayers()
				}));
			}
			res.code(200).send(rooms);
		}
		catch (err){
			res.code(400).send({error: `${err}`});
		}
	});

	//creat tournament room
	fastify.post('/tournament/create', async (req, res) => {
		const { creator,token,sessionId,numberOfPlayers} = req.body;
		const connection = getWs(fastify,sessionId,token,res);

		if (!connection)
				return;
		if(tournaments.userTournament(sessionId,token)){
			res.code(400).send({error: "Player is already in another tournament"})
			return;
		}
		const avatar = getAvatar(fastify,extractId(fastify,token));
		let roomId = tournaments.createRoom(connection,creator,avatar,numberOfPlayers,token,sessionId);
		res.code(200).send({
			id: roomId,
			creator: creator,
			avatar: tournaments.rooms.get(roomId).avatar,
			playersIn: 1,
			playersExpected: numberOfPlayers
		});
	});

	fastify.post('/tournament/join' , async (req, res) =>{
		const { name,token,sessionId,roomId } = req.body;
		let connection = getWs(fastify,sessionId, token,res);

		if(tournaments.userTournament(sessionId,token)){
			res.code(400).send({error: "Player is already in another tournament"})
			return;
		}

		let room = tournaments.joinRoom(roomId,connection,name,token,sessionId);

		if (room.players.length == room.getExpectedPlayers()){
			res.code(200).send({
					id: roomId,
					creator: room.creator,
					playersIn: room.players.length,
					playersExpected: room.getExpectedPlayers(),
					bracket: room.getDraw()
			});
		}
		else{
			res.code(200).send({
					id: roomId,
					creator: room.creator,
					playersIn: room.players.length,
					playersExpected: room.getExpectedPlayers()
			});
		}
	});

	fastify.get('/tournament/start', async (req, res) => {
		const { roomId } = req.query;
		let room = tournaments.getRoom(roomId);
		if (room === undefined)
			res.code(400).send({error: "Error: Cannot found tournament with this id"});
		if (room.playersExpected.size != room.playersIn.length)
			res.code(400).send({error: "Error: Wrong amount of players"});
		room.createMatches();
		res.code(200).send({success: true});
  });

	fastify.get('/tournament/play', { websocket: true }, (connection, req) => {
    const {roomId , matchNumber} = req.query;
		
		const room = tournaments.getRoom(roomId);
		if (room === undefined)
		{
			connection.send(JSON.stringify({ error: 'Room not found' }));
      connection.close();
      console.log('Room not found');
      return;
		}
		const match = room.match.get(parseInt(matchNumber));
		if (match === undefined)
		{
			connection.send(JSON.stringify({ error: 'Match not found' }));
      connection.close();
      console.log('Match not found');
      return;
		}
    tournamentGame(tournaments,match,connection);
  });

}

function getWs(fastify,sessionId, token, res){
	if (!token && !sessionId){
		res.code(400).send({error: "Missing token or sessionId. Cannot identify user."});
		return null;
	}
	let connection;
	try{
		connection = token ? clients.get(getId(fastify,token)) : notAuthenticated.get(sessionId)
	} catch (err){
		console.log(err)
		if (!sessionId){
			res.code(400).send({error: "Wrong token. Cannot identify user."});
			return null;
		}
		connection = notAuthenticated.get(sessionId);
	}
	if (connection === undefined){
		res.code(400).send({error: "Wrong token or sessionId. Cannot identify user."});
		return null;
	}
	return connection;
}

function getId(fastify,token){
	const decoded = fastify.jwt.verify(token);
	return decoded.userId
}

/*
curl -X POST http://localhost:3000/tournament/create   -H "Content-Type: application/json"   -d '{
    "creator": "filip",
    "token": "",
    "sessionId": null,
    "numberOfPlayers": 8
  }'
*/