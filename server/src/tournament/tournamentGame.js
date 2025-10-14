import { authenticateToken } from '../game/authentication.js';
import {
  stopGameLoop,
  resetGameStatus,
  gameLoop,
  updateGameState,
} from '../game/gameState.js';
import { broadcastMessage, broadcastStatus } from '../game/broadcast.js';
import { saveClosedMatch } from '../models/gameHistory.js';
import { authenticatePlayer } from './utils.js';
import { tournamentGameLoop } from './tournamentLoop.js';
import { saveMatchResult } from '../models/gameHistory.js';
import { GAME_CONFIG } from '../constants/gameConfig.js';

export function tournamentGame(fastify, connection, game, match, room) {
  game.clients.add(connection);
  let first = true;

  connection.on('message', (message) => {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (err) {
      console.log('Wrong format of the message - JSON EXPECTED');
      connection.close();
      return;
    }

    if (msg.type == 'auth' && first) {
      assignPlayer(connection, msg.token, msg.sessionId, match, game);
    }
    const role = game.playersManager.getRole(connection);

    // checking user's token or previous authentication
    if (role !== 'spectator' && first) {
      authenticatePlayer(game, connection, fastify, msg, match);
    }
    first = false;

    if (
      msg.type === 'status' &&
      msg.status === 'READY' &&
      !game.isRunning &&
      game.playersManager.playersPresence()
    ) {
      if (role === 'left' && game.readyL === false) {
        game.readyL = true;
        broadcastMessage(game.clients, 'left_player_ready');
        if (game.readyL && game.readyR)
          countdownAndStart(connection, room, match, game, fastify.db);
      }
      if (role === 'right' && game.readyR === false) {
        game.readyR = true;
        broadcastMessage(game.clients, 'right_player_ready');
        if (game.readyL && game.readyR)
          countdownAndStart(connection, room, match, game, fastify.db);
      }
      return;
    }

    //Movement
    if (msg.type === 'move') {
      if (role === 'left') {
        if (msg.direction === 'UP') {
          game.gameState.paddles.left = Math.max(
            0,
            game.gameState.paddles.left - GAME_CONFIG.PADDLE_SPEED,
          );
        } else if (msg.direction === 'DOWN') {
          game.gameState.paddles.left = Math.min(
            340,
            game.gameState.paddles.left + GAME_CONFIG.PADDLE_SPEED,
          );
        }
      } else if (role === 'right') {
        if (msg.direction === 'UP') {
          game.gameState.paddles.right = Math.max(
            0,
            game.gameState.paddles.right - GAME_CONFIG.PADDLE_SPEED,
          );
        } else if (msg.direction === 'DOWN') {
          game.gameState.paddles.right = Math.min(
            340,
            game.gameState.paddles.right + GAME_CONFIG.PADDLE_SPEED,
          );
        }
      }
    }
  });

  connection.on('close', () => {
    try {
      game.clients.delete(connection);

      const role = game.playersManager.getRole(connection);
      if (match.winner || role === 'spectator') {
        return;
      }

      if (role !== 'spectator') {
        if (role === 'left') {
          broadcastMessage(game.clients, 'left_error');
        } else if (role === 'right') {
          broadcastMessage(game.clients, 'right_error');
        }
      }

      game.playersManager.removeTournamentRole(connection);

      if (
        game.playersManager.leftPlayer === null ||
        game.playersManager.rightPlayer === null
      ) {
        stopGameLoop(game);
        game.isRunning = false;
      }

      // Fix: Define gameType for tournament matches
      const gameType = 'tournament';
      if (match.save) {
        saveClosedMatch(fastify.db, role, game.playersManager.stats, gameType);
      }

      if (role === 'left') {
        room.matchFinished(-1, GAME_CONFIG.NUMBER_OF_ROUNDS, match);
      } else if (role === 'right') {
        room.matchFinished(GAME_CONFIG.NUMBER_OF_ROUNDS, -1, match);
      }

      setTimeout(() => {
        try {
          broadcastMessage(game.clients, 'match_finished');
          setTimeout(() => disconectPlayers(game.clients), 3000);
        } catch (error) {
          console.error('Error in match finished timeout:', error);
        }
      }, 3000);
    } catch (error) {
      console.error('Error handling connection close:', error);
    }
  });

  connection.on('error', (err) => {
    try {
      console.error('WebSocket error:', err);
      game.clients.delete(connection);

      const role = game.playersManager.getRole(connection);
      if (match.winner || role === 'spectator') {
        return;
      }

      if (role !== 'spectator') {
        if (role === 'left') {
          broadcastMessage(game.clients, 'left_error');
        } else if (role === 'right') {
          broadcastMessage(game.clients, 'right_error');
        }
      }

      game.playersManager.removeTournamentRole(connection);

      if (
        game.playersManager.leftPlayer === null ||
        game.playersManager.rightPlayer === null
      ) {
        stopGameLoop(game);
        game.isRunning = false;
      }

      // Fix: Define gameType for tournament matches
      const gameType = 'tournament';
      if (match.save) {
        saveClosedMatch(fastify.db, role, game.playersManager.stats, gameType);
      }

      if (role === 'left') {
        room.matchFinished(-1, GAME_CONFIG.NUMBER_OF_ROUNDS, match);
      } else if (role === 'right') {
        room.matchFinished(GAME_CONFIG.NUMBER_OF_ROUNDS, -1, match);
      }

      setTimeout(() => {
        try {
          broadcastMessage(game.clients, 'match_finished');
          setTimeout(() => disconectPlayers(game.clients), 3000);
        } catch (error) {
          console.error('Error in match finished timeout:', error);
        }
      }, 3000);
    } catch (error) {
      console.error('Error handling connection error:', error);
    }
  });
}

function countdownAndStart(connection, room, match, game, db) {
  let count = 3;
  broadcastMessage(game.clients, 'count_to_start');
  function next() {
    if (count > 0) {
      count--;
      setTimeout(next, 1000);
    } else {
      broadcastMessage(game.clients, 'game_on');
      game.isRunning = true;
      tournamentGameLoop(connection, room, match, game, db);
    }
  }
  next();
}

function assignPlayer(connection, token, sessionId, match, game) {
  if (
    (token && token == match.leftPlayer.token) ||
    (sessionId && sessionId == match.leftPlayer.sessionId)
  ) {
    game.playersManager.leftPlayer = connection;
    game.playersManager.roles.set(connection, 'left');
  } else if (
    (token && token == match.rightPlayer.token) ||
    (sessionId && sessionId == match.rightPlayer.sessionId)
  ) {
    game.playersManager.rightPlayer = connection;
    game.playersManager.roles.set(connection, 'right');
  } else game.playersManager.roles.set(connection, 'spectator');

  connection.send(
    JSON.stringify({
      type: 'role',
      role: game.playersManager.getRole(connection),
    }),
  );

  connection.send(
    JSON.stringify({
      type: 'gameState',
      data: game.gameState,
    }),
  );

  // Send nicknames to the connecting player immediately
  connection.send(
    JSON.stringify({
      type: 'nickname',
      object: {
        left: match.leftPlayer?.nickname ?? 'Left',
        right: match.rightPlayer?.nickname ?? 'Right',
      },
    }),
  );

  if (
    game.playersManager.leftPlayer === null ||
    game.playersManager.rightPlayer === null
  ) {
    broadcastMessage(game.clients, 'waiting_for_second_player');
  } else if (
    game.playersManager.leftPlayer != null &&
    game.playersManager.rightPlayer != null
  ) {
    broadcastMessage(game.clients, 'waiting_for_readiness');
    // Broadcast nicknames to all players when both are present
    broadcastStatus(game.clients, 'nickname', {
      left: match.leftPlayer?.nickname ?? 'Left',
      right: match.rightPlayer?.nickname ?? 'Right',
    });
  }
}

function disconectPlayers(clients) {
  try {
    for (const client of clients) {
      if (client && client.readyState === client.OPEN) {
        client.close();
      }
    }
  } catch (error) {
    console.error('Error disconnecting players:', error);
  }
}
