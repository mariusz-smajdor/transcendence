export let gameState = {
    ball: { x: 300, y: 200 },
    paddles: { left: 150, right: 150 },
    score: { left: 0, right: 0 },
};

let ballSpeedX = 3;
let ballSpeedY = 2;
const canvasWidth = 600;
const canvasHeight = 400;
const ballRadius = 10;
const paddleHeight = 60;

export function updateGameState() {
    gameState.ball.x += ballSpeedX;
    gameState.ball.y += ballSpeedY;
  
    if (gameState.ball.y - ballRadius < 0 || gameState.ball.y + ballRadius > canvasHeight) {
      ballSpeedY = -ballSpeedY;
    }
  
    if (
      gameState.ball.x - ballRadius < 20 &&
      gameState.ball.y > gameState.paddles.left &&
      gameState.ball.y < gameState.paddles.left + paddleHeight
    ) {
      ballSpeedX = -ballSpeedX;
    }
  
    if (
      gameState.ball.x + ballRadius > canvasWidth - 20 &&
      gameState.ball.y > gameState.paddles.right &&
      gameState.ball.y < gameState.paddles.right + paddleHeight
    ) {
      ballSpeedX = -ballSpeedX;
    }
  
    if (gameState.ball.x < 0 || gameState.ball.x > canvasWidth) {
      gameState.ball.x = canvasWidth / 2;
      gameState.ball.y = canvasHeight / 2;
      ballSpeedX = 3 * (Math.random() > 0.5 ? 1 : -1);
      ballSpeedY = 2 * (Math.random() > 0.5 ? 1 : -1);
    }
}