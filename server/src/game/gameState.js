import { broadcastGameState } from "../game/broadcast.js";

// export let gameState = {
//   ball: { x: 300, y: 200 },
//   paddles: { left: 150, right: 150 },
//   score: { left: 0, right: 0 },
// };

let ballSpeedX = 3;
let ballSpeedY = 2;
const canvasWidth = 600;
const canvasHeight = 400;
const ballRadius = 10;
const paddleHeight = 60;
const extendedPaddleHeight = paddleHeight + ballRadius


export function updateGameState(gameState) {
  gameState.ball.x += ballSpeedX;
  gameState.ball.y += ballSpeedY;

  //top/bottom edge bounce
  if (gameState.ball.y - ballRadius < 0 || gameState.ball.y + ballRadius > canvasHeight) {
    ballSpeedY = -ballSpeedY;
  }

  //left paddle bounce
  if (
	ballSpeedX < 0 &&
    gameState.ball.x - ballRadius <= 20 &&
	gameState.ball.x - ballRadius >= 16 &&
    gameState.ball.y > gameState.paddles.left - 5 &&
    gameState.ball.y < gameState.paddles.left + paddleHeight + 5
  ) {
	paddleBounce("left");
  }

  //right paddle bounce
  else if (
	ballSpeedX > 0
	&& gameState.ball.x + ballRadius >= canvasWidth - 20 
	&& gameState.ball.x + ballRadius <= canvasWidth - 16
	&& gameState.ball.y > gameState.paddles.right - 5 
	&& gameState.ball.y < gameState.paddles.right + paddleHeight + 5
  ) {
	paddleBounce("right");
  }

  //score
  if (gameState.ball.x < 0 || gameState.ball.x > canvasWidth) {
	if (gameState.ball.x < 0)
		gameState.score.left += 1;
	if (gameState.ball.x > canvasWidth)
		gameState.score.left += 1;
    gameState.ball.x = canvasWidth / 2;
    gameState.ball.y = canvasHeight / 2;
    ballSpeedX = 3 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 2 * (Math.random() > 0.5 ? 1 : -1);
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
    };
}

export function initGame() {
  let gameState = {
    ball: { x: 300, y: 200 },
    paddles: { left: 150, right: 150 },
    score: { left: 0, right: 0 },
  };
  return gameState;
}

export function gameLoop(game) {
  console.log('game started');
  // game.gameState = initGame();
  game.intervalId = setInterval(() => {
    updateGameState(game.gameState);
    let gameStatePropotional = getGameStateProportional(game.gameState);
    broadcastGameState(game.clients, gameStatePropotional);
  }, 20);
}

export function stopGameLoop(game) {
  let intervalId = game.intervalId;
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('game stopped');
  }
}

function paddleBounce(side)
{
	if (side === 'left') {
		const paddleCenter = gameState.paddles.left + paddleHeight / 2;
		const relativeIntersectY = (gameState.ball.y - paddleCenter) / (extendedPaddleHeight / 2);
		const bounceAngle = relativeIntersectY * (Math.PI * 75 / 180);
		const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY);
		ballSpeedX = speed * Math.cos(bounceAngle);
		ballSpeedY = speed * Math.sin(bounceAngle);
	  } else if (side === 'right') {
		const paddleCenter = gameState.paddles.right + paddleHeight / 2;
		const relativeIntersectY = (gameState.ball.y - paddleCenter) / (extendedPaddleHeight / 2);
		const bounceAngle = relativeIntersectY * (Math.PI * 75 / 180);
		const speed = Math.sqrt(ballSpeedX * ballSpeedX + ballSpeedY * ballSpeedY);
		ballSpeedX = -speed * Math.cos(bounceAngle);
		ballSpeedY = speed * Math.sin(bounceAngle);
	  }
}