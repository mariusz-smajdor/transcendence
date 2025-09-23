import { updateGameState, stopGameLoop, getGameStateProportional } from "../game/gameState.js";
import { broadcastGameState, broadcastMessage } from "../game/broadcast.js";
import { Room } from "./tournaments.js";
import { clients } from "../routes/invitations.js";
import { saveClosedMatch, saveMatchResult } from "../models/gameHistory.js";

export function tournamentGameLoop(connection, room, match, game, db) {
	console.log('game started');
	let ballSpeed = {
		ballSpeedX: 3,
		ballSpeedY: 1
};
	let id = setInterval(() => {
		updateGameState(game.gameState, ballSpeed);
		if (game.gameState.gameOver) {
			stopGameLoop(game);
			game.isRunning = false;
			const winner = game.gameState.score.left >= 11 ? 'left' : 'right';
			if(match.save){
				game.playersManager.updateScore(game.gameState.score, game.gameType);
				saveMatchResult(db,game.playersManager.stats, winner, game.gameType)
			}
			room.matchFinished(game.gameState.score.left, game.gameState.score.right, match);
			const gameStatePropotional = getGameStateProportional(game.gameState);
			broadcastGameState(game.clients, gameStatePropotional);
			broadcastMessage(game.clients, `The winner is: ${game.playersManager.stats.get(winner)?.username ?? winner}`)
			setTimeout(() => {
					broadcastMessage(game.clients, 'match_finished');
					setTimeout(() => {
						for(const client of game.clients)
							client.close();
					}, 3000);
			}, 3000);
		return;
	}
		let gameStatePropotional = getGameStateProportional(game.gameState);
		broadcastGameState(game.clients, gameStatePropotional);
}, 20);
	game.intervalId.add(id);
}