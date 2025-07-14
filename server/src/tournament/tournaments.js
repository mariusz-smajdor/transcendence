import { uuidv4 } from "uuid";
import { initGame } from "../game/gameState";

export class Tournaments{
	rooms = new Map();// roomId : room
	
	joinRoom(roomId,connection,nickname,token = null, sessionId = null){
		let room = this.rooms.get(roomId);
		room.addPlayer(connection,nickname,token,sessionId);
	}

	createRoom(connection, creator, numberOfPlayers, token = null, session = null){
		const room  = new Room(creator);
		const roomId = uuidv4()
		room.addPlayer(connection,creator,token,sessionId);
		rooms.set(roomId,room);

	}

	userTournament(sessionId = null, token = null){
		for (const room of this.rooms){
			for (const player of room.players){
				if (token && player.token === token)
					return room;
				if (!token && player.connection === connection)
					return room;
			}
		}
		return null;
	}

}

export class Room{
	tournamentGames = new Map(); // matchID: Match
	players = new Array(); //tmpId: Player
	expectedPlayers = new Set();
	courentRound = 1;
	matches = new Set();
	matchesToPlay = 0;
	matchesPlayed = 0;
	creator = null;

	constructor(creator,numberOfPlayers){
		this.creator = creator;
		setExpectedPlayers(numberOfPlayers);
		setMatchesToPlay();
	}

	setExpectedPlayers(numberOfPlayers){
		for(let i = 1; i <= numberOfPlayers; i++){
			this.expectedPlayers.add(i);
		}
	}

	setMatchesToPlay(){
		this.matchesToPlay = this.expectedPlayers.size - 1; 
	}

	tournamentDraw(){
		let tmp = new Array(this.expectedPlayers);
		for(const player of this.players){
			let index = Math.floor(Math.random() * tmp.length());
			player.tmpId = tmp[index];
			tmp.splice(index,1);
		}
	}

	addPlayer(connection,nickname,token,sessionId){
		this.players.add(new Player(connection,nickname,token,nickname));
	}

	getActivePlayers(){
		return this.players.size;
	}	

	getExpectedPlayers(){
		return this.expectedPlayers.length;
	}

	createMatches(){
		let toCreate =  this.players.size / Math.pow(2,this.courentRound);
		let matchId = this.players.size / toCreate;
		for(i = 0; i < toCreate; i++){
			const gameId = uuidv4();
			games.set(gameId, {
				gameState: initGame(),
				clients: new Set(),
				playersManager: new PlayersManager(),
				intervalId: new Set(),
				isRunning: false,
				readyR: false,
				readyL: false,
				gameType: "",
				needAuthentication: 1 //0 - no, 1 - optional 2 - required 
			});		
		}
	}
}

export class Player{
	tmpId = null
	sessionId = null //to identify logged in players
	connection = null //for sending the notification
	token = null; //to identify logged in players
	nickname = null;
	results = new Array(); //wins and looses, index is representing the round 

	constructor(connection,nickname,sessionId = null,token = null){
		this.sessionId = sessionId;
		this.token = token;
		this.nickname = nickname;
		this.connection = connection;
	}
}

export class Match{
	gameId = uuidv4();
	game = {
				gameState: initGame(),
				clients: new Set(),
				playersManager: new PlayersManager(),
				intervalId: new Set(),
				isRunning: false,
				readyR: false,
				readyL: false,
				gameType: "",
				needAuthentication: 0 //0 - no, 1 - optional 2 - required 
	}
	leftPlayer = null;
	rightPlayer = null;
	winner = null; //null - match unfinished
	leftScore = 0;
	rightScore = 0;
}

