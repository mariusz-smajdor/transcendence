import { v4 as uuidv4 } from "uuid";
import { initGame } from "../game/gameState.js";
import { clients, notAuthenticated } from "../routes/game.js";

export class Tournaments{
	rooms = new Map();// roomId : room
	
	getRoom(roomId){
		return this.rooms.get(roomId);
	}

	joinRoom(roomId,connection,nickname,token = null, sessionId = null){
		let room = this.rooms.get(roomId);
		room.addPlayer(connection,nickname,token,sessionId);
		return room;
	}

	createRoom(connection, creator, numberOfPlayers, token = null, sessionId = null){
		const room  = new Room(creator, numberOfPlayers);
		const roomId = uuidv4();
		room.id = roomId;
		room.addPlayer(connection,creator,token,sessionId);
		this.rooms.set(roomId,room);
		return roomId;
	}

	userTournament(sessionId = null, token = null){
		for (const room of this.rooms.values()){
			for (const player of room.players){
				if (token && player.token === token)
					return room;
				if (!token && player.sessionId === sessionId)
					return room;
			}
		}
		return null;
	}

}

export class Room{
	id = null;
	tournamentGames = new Map(); // matchID: Match
	players = new Array(); //Player
	expectedPlayers = new Set();
	courentRound = 1;
	matches = new Map(); //matchNumber: Match
	matchesToPlay = 0;
	matchesCreated = 0;
	matchesPlayed = 0
	creator = null;

	constructor(creator,numberOfPlayers){
		this.creator = creator;
		this.setExpectedPlayers(numberOfPlayers);
		this.setMatchesToPlay();
	}

	//to do:checking if the user joined the match, if not walkover
	sendNofication(connection, matchNum){
		connection.send(JSON.stringify({
			type: 'join',
			matchNumber: match.matchNumber
		}));
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

	getDraw(){
		this.tournamentDraw();
		let draw = [];
		this.players.forEach(element => {
			draw.push({id: element.tmpId, nickname: element.nickname});
		});
		return draw;
	}

	addPlayer(connection,nickname,token,sessionId){
		this.players.push(new Player(connection,nickname,sessionId,token));
	}

	getPlayersForMatch(match, matchNumber){
		let toCheck = 2 * round;
		let i = toCheck * (matchNumber - this.matchesPlayed) - 1;
		for(let last = i + toCheck - 1; i < last; i++){
			if (this.players[i].lastWin = true){
				this.sendNofication(this.players[i].connection,matchNumber);
				if (!match.leftIndex)
					match.leftIndex = i;
				else{
					match.rightIndex = i;
					return;
				}
			}
		}
	}
	getActivePlayers(){
		return this.players.length;
	}	

	getExpectedPlayers(){
		return this.expectedPlayers.size;
	}

	createMatches(){
		let toCreate = this.players.length / Math.pow(2,this.courentRound);
		let matchNum = this.matchesCreated + 1; 
		for(i = 0; i < toCreate; i++){
			let match = new Match();
			this.getPlayersForMatch(match, matchNum);
			this.matches.set(matchNum);
			this.matchesCreated++;
			matchNum++;
		}
	}

}

export class Player{
	tmpId = null
	sessionId = null //to identify logged in players
	connection = null //for sending the notification
	token = null; //to identify logged in players
	nickname = null;
	lastWin = true;
	//results = new Array(); //wins and looses, index is representing the round ->
	//->(For now useless)

	constructor(connection,nickname,sessionId = null,token = null){
		this.sessionId = sessionId;
		this.token = token;
		this.nickname = nickname;
		this.connection = connection;
	}
}

export class Match{
	matchNumber = null;
	gameId = uuidv4();//probably usless 
	game = {
				gameState: initGame(),
				clients: new Set(),
				playersManager: new PlayersManager(),
				intervalId: new Set(),
				isRunning: false,
				readyR: false,
				readyL: false,
				gameType: "", //probably useless
				needAuthentication: 1 //0 - no, 1 - optional 2 - required 
	}
	leftIndex = null;//token/sessionId to verify player
	rightIndex = null;
	winner = null; //null - match unfinished
	leftScore = 0;
	rightScore = 0;

}

