import { tournamentGame } from "../tournament/tournamentGame";
import { Tournaments } from "../tournament/tournaments";
import { clients, notAuthenticated } from "./game";

const tournaments = new Tournaments();

export async function tournamentRoute(fastify){
	//check for available tournamnets or open the current tournament
	fastify.post('/tournament/rooms', async (req, res) =>{
		let {token , sessionId} = req.body;
		let userRoom = tournaments.userTournament(sessionId,token);
		let rooms;
		if (userRoom){
			rooms = {
				found: true,
				id: userRoom.roomId,
				creator: userRoom.creator,
				playersIn: userRoom.players.size,
				playersExpected: 8};
		}
		else{
			rooms = Array.from(tournaments.rooms).map(room => ({
				found: false,
				id: room.roomId,
				creator: room.creator,
				playersIn: room.players.size,
				playersExpected: 8
			}));
		}
		res.code(200).send(rooms);
	})

	//creat tournament room
	fastify.post('/tournament/create'), async (req, res) =>{
		const { creator,token,sessionId,numberOfPlayers} = req.body;
		const connection = getWs(sessionId,token,res);

		let roomId = tournaments.createRoom(connection,creator,numberOfPlayers,token,sessionId);
		res.code(200).send({
			id: roomId,
			creator: creator,
			playersIn: 1,
			playersExpected: numberOfPlayers
		});
	}

	fastify.post('/tournament/join'), async (req, res) =>{
		const { name,token,sessionId,roomId } = req.body;
		let connection = getWs(sessionId, token,res);

		let room = tournaments.joinRoom(roomId,connection,name,token,sessionId);

		if (room.players.size == room.playersExpected.size){
			res.code(200).send({
					id: roomId,
					creator: room.creator,
					playersIn: room.players.size,
					playersExpected: room.playersExpected.size,
					bracket: room.getDraw()
			});
		}
		else{
			res.code(200).send({
					id: roomId,
					creator: room.creator,
					playersIn: room.players.size,
					playersExpected: room.playersExpected.size
			});
		}
	}

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

	fastify.post('/tournament/play', { websocket: true }, (connection, req) => {
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
    manageMatchWebSocket(tournaments,match,connection);
  });

}

function getWs(sessionId, token, res){
	if (!token && !sessionId){
		res.code(400).send({error: "Missing token or sessionId. Cannot identify user."});
		return null;
	}
	const connection = token ? clients.get(token) : notAuthenticated.get(sessionId)
	if (connection === undefined){
		res.code(400).send({error: "Wrong token or sessionId. Cannot identify user."});
		return null;
	}
	return connection;
}