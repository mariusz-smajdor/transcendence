import { tournamentGame } from "../tournament/tournamentGame";
import { Tournaments } from "../tournament/tournaments";
import { clients, notAuthenticated } from "./game";

const tournaments = new Tournaments();

export async function tournamentRoute(fastify){

	fastify.post('/tournament/rooms', async (req, res) =>{
		let {token , sessionId} = req.body;
		let userRoom = tournaments.userTournament(sessionId,token);
		if (userRoom){
			const rooms = {
				found: true,
				id: userRoom.roomId,
				creator: userRoom.creator,
				playersIn: userRoom.players.size,
				playersExpected: 8};
		}
		else{
			const rooms = Array.from(tournaments.rooms).map(room => ({
				found: false,
				id: room.roomId,
				creator: room.creator,
				playersIn: room.players.size,
				playersExpected: 8
			}));
		}
		return {rooms};
	})

	//in progres....
	fastify.post('/tournament/create'), async (req, res) =>{
		const { creator } = req.body;
		
	}

	fastify.post('/tournament/join'), async (req, res) =>{
		const { name,token,sessionId,roomId } = req.body;
		tournaments.joinRoom()

		
		
	}

	fastify.get('/tournament', { websocket: true }, (connection, req) => {
    const { gameId } = req.query;
    const game = games.get()
    console.log('New WebSocket connection - address:', req.socket.remoteAddress);

    if (!game) {
      connection.send(JSON.stringify({ error: 'Game not found' }));
      connection.close();
      console.log('Game not found');
      return;
    }
    manageLocalGameWebSocket(game, connection, games, gameId);
  });

	fastify.get('/tournamentgame', { websocket: true }, (connection, req) => {
    const { roomId, gameId } = req.query;
    const game = games.get()
    console.log('New WebSocket connection - address:', req.socket.remoteAddress);

    if (!game) {
      connection.send(JSON.stringify({ error: 'Game not found' }));
      connection.close();
      console.log('Game not found');
      return;
    }
    manageLocalGameWebSocket(game, connection, games, gameId);
  });

}