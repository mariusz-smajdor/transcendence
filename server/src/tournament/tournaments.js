import { v4 as uuidv4 } from "uuid";
import { initGame } from "../game/gameState.js";
import { clients, notAuthenticated } from "../routes/game.js";
import { extractId , getAvatar} from "./utils.js";
import { PlayersManager } from "../game/players.js"

export class Tournaments{
	rooms = new Map();// roomId : room
	
	playerLeave(room,token,sessionId){
		const number = room.players.length;
		room.removePlayer(token,sessionId);
		if (number === room.players.length){
			res.code(400).send({error: "Error: Player is not a member of this room"});
			return false;
		}
		if (room.players.length === 0)
			this.rooms.delete(room.id);
		return true;
	}

	getRoom(roomId){
		return this.rooms.get(roomId);
	}

	joinRoom(roomId,connection,nickname,token = null, sessionId = null){
		let room = this.rooms.get(roomId);
		room.addPlayer(connection,nickname,token,sessionId);
		return room;
	}

	createRoom(connection, creator, avatar, numberOfPlayers, token = null, sessionId = null){
		const room  = new Room(creator, numberOfPlayers, avatar);
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
				if (sessionId && player.sessionId === sessionId)
					return room;
			}
		}
		return null;
	}

}

export class Room{
	id = null;
	players = new Array(); //Player
	expectedPlayers = new Set();
	courentRound = 1;
	matches = new Map(); //gameId: Match
	matchesToPlay = 0;
	matchesCreated = 0;
	matchesPlayed = 0
	creator = null;
	gameOn = false;

	constructor(creator,numberOfPlayers, avatar){
		this.creator = creator;
		this.avatar = avatar;
		this.setExpectedPlayers(numberOfPlayers);
		this.setMatchesToPlay();
	}

	//to do:checking if the user joined the match, if not walkover
	sendNotifications(){
		for(let player of this.players){
			if (!player.lastWin){
				//console.log(player.lastWin);
				continue;
			}
			player.connection.send(JSON.stringify({
				type: 'join'
			}));
		}
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
		let tmp = Array.from(this.expectedPlayers);
		for(const player of this.players){
			let index = Math.floor(Math.random() * tmp.length);
			player.tmpId = tmp[index];
			tmp.splice(index,1);
		}
		this.sortPlayersOnTmpId();
	}

	sortPlayersOnTmpId() {
    this.players.sort((a, b) => {
        return a.tmpId - b.tmpId;
    });
	}

	getDraw(){
		this.tournamentDraw();
		let draw = [];
		this.players.forEach(element => {
			draw.push({id: element.tmpId, nickname: element.nickname});
		});
		return draw;
	}

	getMatches(){ //result scoreL: x, scoreR: y, winner: nickname
		let result = new Array();
		if (!this.matches)
			return result;
		this.matches.forEach((match) => {
			result.push({scoreL: match.game.gameState.score.left,
				scoreR: match.game.gameState.score.right,
				winner: match.winner});
		});
		return result;
	}

	addPlayer(connection,nickname,token,sessionId){
		this.players.push(new Player(connection,nickname,sessionId,token));
		if(this.players.length === this.expectedPlayers.size){
			this.createMatches();
		}
	}

	removePlayer(token = null,sessionId = null){
		this.players = this.players.filter(player => {
			if (token && token === player.token)
				return false;
			if (sessionId && sessionId === player.sessionId)
				return false;
			return true;
		})
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
		let roundMatchNum = 1;
		for(let i = 0; i < toCreate; i++){
			let match = new Match();
			this.matches.set(match.gameId, match);
			this.assignPlayers(match,roundMatchNum);
			//console.log(match);
			roundMatchNum++;
			this.matchesCreated++;
			matchNum++;
		}
		this.sendNotifications();
	}

	assignPlayers(match, roundMatchNum){
		let playersToCheck = Math.pow(2,this.courentRound);
		for(let i = playersToCheck * (roundMatchNum - 1);
			 i < playersToCheck * (roundMatchNum - 1) + playersToCheck; i++){
			let player = this.players[i];
			//console.log(i);
			if (!player.lastWin)
				continue;
			if (!match.leftPlayer)
				match.leftPlayer = player.token ? player.token : player.sessionId;
			else
				match.rightPlayer = player.token ? player.token : player.sessionId;
		}
	}

	getMatchToPlay(token = null, sessionId = null){
		for (let match of this.matches.values()){
			if (match.winner)
				continue;
			if (token && (token === match.leftPlayer || token === match.rightPlayer))
				return match.gameId;
			if (sessionId && (sessionId === match.leftPlayer || sessionId === match.rightPlayer))
				return match.gameId;
		}
		return null;
	}
}

export class Player{
	tmpId = null
	sessionId = null //to identify anonymous players
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
	gameId = uuidv4();
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
	leftPlayer = null;//token/sessionId to verify player
	rightPlayer = null;
	winner = null; //null - match unfinished
	leftScore = 0;
	rightScore = 0;

}

