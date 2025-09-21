import { broadcastGameState, broadcastMessage } from "../game/broadcast.js";
import { startAI } from "./aiPong.js";
import { saveMatchResult } from "../models/gameHistory.js";
const canvasWidth = 600;
const canvasHeight = 400;
const ballRadius = 10;
const paddleHeight = 60;
const extendedPaddleHeight = paddleHeight + ballRadius

export function updateGameState(gameState, ballSpeed) {
  gameState.ball.x += ballSpeed.ballSpeedX;
  gameState.ball.y += ballSpeed.ballSpeedY;

  //top/bottom edge bounce
  if (gameState.ball.y - ballRadius < 0 && ballSpeed.ballSpeedY < 0) {
	  ballSpeed.ballSpeedY = -ballSpeed.ballSpeedY;
	}
	if (gameState.ball.y + ballRadius > canvasHeight && ballSpeed.ballSpeedY > 0){
	  ballSpeed.ballSpeedY = -ballSpeed.ballSpeedY;
	}

  //left paddle bounce
  if (
    ballSpeed.ballSpeedX < 0 &&
    gameState.ball.x - ballRadius <= 20 &&
    gameState.ball.x - ballRadius >= 12 &&
    gameState.ball.y > gameState.paddles.left - 5 &&
    gameState.ball.y < gameState.paddles.left + paddleHeight + 5
  ) {
    paddleBounce(gameState, ballSpeed, "left");
  }

  //right paddle bounce
  else if (
    ballSpeed.ballSpeedX > 0
    && gameState.ball.x + ballRadius >= canvasWidth - 20
    && gameState.ball.x + ballRadius <= canvasWidth - 12
    && gameState.ball.y > gameState.paddles.right - 5
    && gameState.ball.y < gameState.paddles.right + paddleHeight + 5
  ) {
    paddleBounce(gameState, ballSpeed, "right");
  }

  //score
  if (gameState.ball.x < 0 || gameState.ball.x > canvasWidth) {
    if (gameState.ball.x < 0)
      gameState.score.right += 1;
    if (gameState.ball.x > canvasWidth)
      gameState.score.left += 1;
	if (gameState.score.left >= 11 || gameState.score.right >= 11) {
		gameState.gameOver = true;
		return;
	  }
    gameState.ball.x = canvasWidth / 2;
    gameState.ball.y = canvasHeight / 2;
    ballSpeed.ballSpeedX = 3 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeed.ballSpeedY = 0.1;
  }

}

export function getGameStateProportional(gameState) {
  return {
    ball: {
      x: gameState.ball.x / canvasWidth,
      y: gameState.ball.y / canvasHeight,
    },
    paddles: {
      left: gameState.paddles.left / canvasHeight,
      right: gameState.paddles.right / canvasHeight,
    },
    score: { ...gameState.score },
	gameOver: gameState.gameOver,
  };
}

export function initGame() {
  let gameState = {
    ball: { x: 300, y: 200 },
    paddles: { left: 150, right: 150 },
    score: { left: 0, right: 0 },
	gameOver: false
  };
  return gameState;
}

export function gameLoop(game, db) {
  console.log('game started');
  let ballSpeed = {
    ballSpeedX: 3,
    ballSpeedY: 1
};
  if (game.gameType === "CPU")
  	startAI(game,ballSpeed);
  let id = setInterval(() => {
	  updateGameState(game.gameState, ballSpeed);
	  if (game.gameState.gameOver) {
		  stopGameLoop(game);
		  game.isRunning = false;
		  const winner = game.gameState.score.left >= 11 ? 'left' : 'right';
		  if(game.needAuthentication === 2){
			  game.playersManager.updateScore(game.gameState.score, game.gameType);
			  saveMatchResult(db,game.playersManager.stats, winner, game.gameType)
			}
			const gameStatePropotional = getGameStateProportional(game.gameState);
			broadcastGameState(game.clients, gameStatePropotional);
			broadcastMessage(game.clients, `The winner is: ${game.playersManager.stats.get(winner)?.username ?? winner}`);
		return;
	}
    let gameStatePropotional = getGameStateProportional(game.gameState);
    broadcastGameState(game.clients, gameStatePropotional);
}, 20);
  game.intervalId.add(id);
}

export function stopGameLoop(game) {
	let ids = game.intervalId; 
	ids.forEach((id) => {
		clearInterval(id);
		ids.delete(id);
  	});
	console.log('Game stopped');
}

export function resetGameStatus(game, rematch = true){
	game.gameState = initGame();
	game.readyL = false;
	game.readyR = false;
	if (rematch)
		broadcastMessage(game.clients, 'rematch');
	else
		broadcastMessage(game.clients, 'reset')
	broadcastGameState(game.clients, getGameStateProportional(game.gameState));
}

function paddleBounce(gameState, ballSpeed, side) {
  if (side === 'left') {
    const paddleCenter = gameState.paddles.left + paddleHeight / 2;
    const relativeIntersectY = (gameState.ball.y - paddleCenter) / (extendedPaddleHeight / 2);
    const bounceAngle = relativeIntersectY * (Math.PI * 75 / 180);
    const speed = Math.sqrt(ballSpeed.ballSpeedX * ballSpeed.ballSpeedX + ballSpeed.ballSpeedY * ballSpeed.ballSpeedY);
    ballSpeed.ballSpeedX = speed * Math.cos(bounceAngle);
    ballSpeed.ballSpeedY = speed * Math.sin(bounceAngle);
  } else if (side === 'right') {
    const paddleCenter = gameState.paddles.right + paddleHeight / 2;
    const relativeIntersectY = (gameState.ball.y - paddleCenter) / (extendedPaddleHeight / 2);
    const bounceAngle = relativeIntersectY * (Math.PI * 75 / 180);
    const speed = Math.sqrt(ballSpeed.ballSpeedX * ballSpeed.ballSpeedX + ballSpeed.ballSpeedY * ballSpeed.ballSpeedY);
    ballSpeed.ballSpeedX = -speed * Math.cos(bounceAngle);
    ballSpeed.ballSpeedY = speed * Math.sin(bounceAngle);
  }
  ballSpeed.ballSpeedX *= 1.05;
}