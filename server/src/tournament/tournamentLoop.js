import {
  updateGameState,
  stopGameLoop,
  getGameStateProportional,
} from '../game/gameState.js';
import { broadcastGameState, broadcastMessage } from '../game/broadcast.js';
import { Room } from './tournaments.js';
import { clients } from '../routes/invitations.js';
import { saveClosedMatch, saveMatchResult, saveMatchToBlockchain } from '../models/gameHistory.js';
import { GAME_CONFIG } from '../constants/gameConfig.js';

export function tournamentGameLoop(connection, room, match, game, db) {
  console.log('game started');
  let ballSpeed = {
    ballSpeedX: GAME_CONFIG.BALL_SPEED,
    ballSpeedY: 1,
  };
  let id = setInterval(async () => {
    updateGameState(game.gameState, ballSpeed);
    if (game.gameState.gameOver) {
      stopGameLoop(game);
      game.isRunning = false;
      const winner =
        game.gameState.score.left >= GAME_CONFIG.NUMBER_OF_ROUNDS
          ? 'left'
          : 'right';
      try {
        if (match.save) {
          game.playersManager.updateScore(
            game.gameState.score,
            game.gameType,
          );
          const { dbResult } = await saveMatchResult(
            db,
            game.playersManager.stats,
            winner,
            game.gameType,
          );
          // Always save tournament results to blockchain at match end
          await saveMatchToBlockchain(
            db,
            game.playersManager.stats,
            winner,
            dbResult?.lastInsertRowid,
          );
        } else {
          // No DB save requested, but still save to blockchain (dbRowId omitted)
          await saveMatchToBlockchain(db, game.playersManager.stats, winner);
        }
      } catch (e) {
        console.error('Error saving match results:', e);
      }
      room.matchFinished(
        game.gameState.score.left,
        game.gameState.score.right,
        match,
      );
      const gameStatePropotional = getGameStateProportional(game.gameState);
      broadcastGameState(game.clients, gameStatePropotional);
      broadcastMessage(
        game.clients,
        `The winner is: ${game.playersManager.stats.get(winner)?.username ?? winner
        }`,
      );
      setTimeout(() => {
        broadcastMessage(game.clients, 'match_finished');
        setTimeout(() => {
          for (const client of game.clients) client.close();
        }, 3000);
      }, 3000);
      return;
    }
    let gameStatePropotional = getGameStateProportional(game.gameState);
    broadcastGameState(game.clients, gameStatePropotional);
  }, 20);
  game.intervalId.add(id);
}
