import { v4 as uuidv4 } from 'uuid';
import { initGame } from '../game/gameState.js';
import { clients, notAuthenticated } from '../routes/invitations.js';
import { extractId, getAvatar } from './utils.js';
import { PlayersManager } from '../game/players.js';
import {
  closeOldWs,
  closeCurrentWs,
  addNewConnection,
} from '../routes/invitations.js';
import { wsMessage } from '../routes/invitations.js';
import { GAME_CONFIG } from '../constants/gameConfig.js';

export class Tournaments {
  rooms = new Map(); // roomId : room

  switchWs(sessionId, token, userId, connection) {
    let room = this.userTournament(sessionId, token);
    if (!room) {
      closeOldWs(sessionId, userId);
      addNewConnection(sessionId, userId, connection);
    } else {
      if (room.gameOn) closeCurrentWs(connection);
      else {
        let player = room.getPlayer(sessionId, token);
        player.changeWs(connection);
        closeOldWs(sessionId, userId);
        addNewConnection(sessionId, userId, connection);
      }
    }
  }

  playerLeave(room, token, sessionId) {
    const number = room.getOnlinePlayers();
    room.removePlayer(token, sessionId);
    if (number === room.getOnlinePlayers()) {
      return false;
    }
    if (room.getOnlinePlayers() === 0) this.rooms.delete(room.id);
    if (room.gameOn) room.checkMatches();
    return true;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId, connection, nickname, token = null, sessionId = null) {
    let room = this.rooms.get(roomId);
    room.addPlayer(connection, nickname, token, sessionId);
    return room;
  }

  createRoom(
    connection,
    creator,
    avatar,
    numberOfPlayers,
    token = null,
    sessionId = null,
  ) {
    const room = new Room(creator, numberOfPlayers, avatar);
    const roomId = uuidv4();
    room.id = roomId;
    room.addPlayer(connection, creator, token, sessionId);
    this.rooms.set(roomId, room);
    return roomId;
  }

  userTournament(sessionId = null, token = null) {
    for (const room of this.rooms.values()) {
      for (const player of room.players) {
        if (!player.active) continue;
        if (token && player.token === token) return room;
        if (sessionId && player.sessionId === sessionId) return room;
      }
    }
    return null;
  }
}

export class Room {
  id = null;
  players = new Array(); //Player
  expectedPlayers = new Set();
  currentRound = 1;
  matches = new Map(); //gameId: Match
  matchesToPlay = 0;
  matchesCreated = 0;
  matchesPlayed = 0;
  creator = null;
  gameOn = false;

  constructor(creator, numberOfPlayers, avatar) {
    this.creator = creator;
    this.avatar = avatar;
    this.setExpectedPlayers(numberOfPlayers);
    this.setMatchesToPlay();
  }

  positions() {
    return this.players.map((player) => player.nickname);
  }

  //to do:checking if the user joined the match, if not walkover
  sendNotifications() {
    for (let player of this.players) {
      if (!player.lastWin || !player.active) {
        //console.log(player.lastWin);
        continue;
      }
      if (player.connection)
        wsMessage('You can join to tournamet game!', player.connection);
    }
  }

  getPlayer(sessionId, token) {
    for (const player of this.players) {
      if (sessionId && sessionId === player.sessionId) return player;
      if (token && token === player.token) return player;
    }
    return null;
  }

  setExpectedPlayers(numberOfPlayers) {
    for (let i = 1; i <= numberOfPlayers; i++) {
      this.expectedPlayers.add(i);
    }
  }

  setMatchesToPlay() {
    this.matchesToPlay = this.expectedPlayers.size - 1;
  }

  tournamentDraw() {
    let tmp = Array.from(this.expectedPlayers);
    for (const player of this.players) {
      let index = Math.floor(Math.random() * tmp.length);
      player.tmpId = tmp[index];
      tmp.splice(index, 1);
    }
    this.sortPlayersOnTmpId();
  }

  sortPlayersOnTmpId() {
    this.players.sort((a, b) => {
      return a.tmpId - b.tmpId;
    });
  }

  getDraw() {
    this.tournamentDraw();
    let draw = [];
    this.players.forEach((element) => {
      draw.push(element.nickname);
    });
    return draw;
  }

  getMatches() {
    //result scoreL: x, scoreR: y, winner: nickname
    let result = new Array();
    if (!this.matches) return result;
    this.matches.forEach((match) => {
      result.push({
        scoreL: match.game.gameState.score.left,
        scoreR: match.game.gameState.score.right,
        winner: match.winner,
      });
    });
    return result;
  }

  getOnlinePlayers() {
    let i = 0;
    for (const player of this.players) {
      if (player.active) i++;
    }
    return i;
  }

  addPlayer(connection, nickname, token, sessionId) {
    this.players.push(new Player(connection, nickname, sessionId, token));

    // Broadcast player update to all existing players in the room
    this.broadcastPlayerUpdate();

    if (this.players.length === this.expectedPlayers.size) {
      this.gameOn = true;
      this.createMatches();
    }
  }

  removePlayer(token = null, sessionId = null) {
    if (this.gameOn) {
      for (const player of this.players) {
        if (
          (token && token === player.token) ||
          (sessionId && sessionId === player.sessionId)
        ) {
          player.connection = null;
          player.sessionId = null;
          player.token = null;
          player.active = false;
        }
      }
    } else {
      this.players = this.players.filter((player) => {
        if (token && token === player.token) return false;
        if (sessionId && sessionId === player.sessionId) return false;
        return true;
      });
    }

    // Broadcast player update after removal
    this.broadcastPlayerUpdate();
  }

  getActivePlayers() {
    return this.players.length;
  }

  getExpectedPlayers() {
    return this.expectedPlayers.size;
  }

  createMatches() {
    let toCreate = this.players.length / Math.pow(2, this.currentRound);
    let matchNum = this.matchesCreated + 1;
    let roundMatchNum = 1;
    for (let i = 0; i < toCreate; i++) {
      let match = new Match();
      this.matches.set(match.gameId, match);
      this.assignPlayers(match, roundMatchNum);
      //console.log(match);
      roundMatchNum++;
      this.matchesCreated++;
      matchNum++;
    }
    this.sendNotifications();
    this.checkMatches();
  }

  checkMatches() {
    for (const match of this.matches.values()) {
      if (match.winner) continue;
      if (!match.leftPlayer.active) {
        match.winner = true;
        match.leftPlayer.lastWin = false;
        match.leftScore = -1;
        match.rightScore = GAME_CONFIG.NUMBER_OF_ROUNDS;
        this.nextRound();
      } else if (!match.rightPlayer.active) {
        match.winner = true;
        match.rightPlayer.lastWin = false;
        match.leftScore = GAME_CONFIG.NUMBER_OF_ROUNDS;
        match.rightScore = -1;
        this.nextRound();
      }
    }
  }

  assignPlayers(match, roundMatchNum) {
    let playersToCheck = Math.pow(2, this.currentRound);
    for (
      let i = playersToCheck * (roundMatchNum - 1);
      i < playersToCheck * (roundMatchNum - 1) + playersToCheck;
      i++
    ) {
      let player = this.players[i];
      //console.log(i);
      if (!player.lastWin) continue;
      if (!match.leftPlayer) match.leftPlayer = player;
      else match.rightPlayer = player;
    }
  }

  getMatchToPlay(token = null, sessionId = null) {
    for (let match of this.matches.values()) {
      if (match.winner) continue;
      if (
        token &&
        (token === match.leftPlayer.token || token === match.rightPlayer.token)
      )
        return match.gameId;
      if (
        sessionId &&
        (sessionId === match.leftPlayer.sessionId ||
          sessionId === match.rightPlayer.sessionId)
      )
        return match.gameId;
    }
    return null;
  }

  matchFinished(leftScore, rightScore, match) {
    if (match.winner) return;
    match.leftScore = leftScore;
    match.rightScore = rightScore;
    match.winner = true;
    this.nextRound();
  }

  nextRound() {
    if (this.roundOver()) {
      this.currentRound++;
      //no more rounds
      if (this.currentRound > this.expectedRounds()) {
        return;
      }
      this.createMatches();
    }
  }

  expectedRounds() {
    let i = this.expectedPlayers.size;
    let expectedRounds = 0;
    while (i != 1) {
      i /= 2;
      expectedRounds++;
    }
    return expectedRounds;
  }

  roundOver() {
    for (const match of this.matches.values()) {
      if (!match.winner) {
        return false;
      }
    }
    return true;
  }

  broadcastPlayerUpdate() {
    // Send tournament update to all players with active connections
    for (const player of this.players) {
      if (player.connection && player.active) {
        try {
          player.connection.send(
            JSON.stringify({
              type: 'tournament_update',
              playersIn: this.players.length,
              playersExpected: this.getExpectedPlayers(),
              positions: this.positions(),
              gameOn: this.gameOn,
            }),
          );
        } catch (error) {
          console.error('Error broadcasting tournament update:', error);
        }
      }
    }
  }
}

export class Player {
  tmpId = null;
  sessionId = null; //to identify anonymous players
  connection = null; //for sending the notification
  token = null; //to identify logged in players
  nickname = null;
  lastWin = true;
  active = true;
  //results = new Array(); //wins and looses, index is representing the round ->
  //->(For now useless)

  constructor(connection, nickname, sessionId = null, token = null) {
    this.sessionId = sessionId;
    this.token = token;
    this.nickname = nickname;
    this.connection = connection;
  }

  changeWs(connection) {
    this.connection = connection;
  }
}

export class Match {
  gameId = uuidv4();
  game = {
    gameState: initGame(),
    clients: new Set(),
    playersManager: new PlayersManager(),
    intervalId: new Set(),
    isRunning: false,
    readyR: false,
    readyL: false,
    gameType: 'Tournament',
  };
  leftPlayer = null; //reference to player
  rightPlayer = null;
  winner = null; //null - match unfinished
  leftScore = 0;
  rightScore = 0;
  save = null;
}
