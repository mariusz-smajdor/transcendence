const clients = new Set();

let score = 0;
let leftPaddleY = 170;
let rightPaddleY = 170;

let ballX = 300;
let ballY = 200;
let ballSpeedX = 3;
let ballSpeedY = 2;
const canvasWidth = 600;
const canvasHeight = 400;
const ballRadius = 10;
const paddleHeight = 60;

let leftPlayer = null;
let rightPlayer = null;
let spectators = new Set();

async function gameRoutes(fastify) {
  fastify.get('/game', { websocket: true }, (connection, req) => {
    console.log('Nowe połączenie WebSocket - adres:', req.socket.remoteAddress);

    // const token = req.cookies.access_token;
    // try {
    //   req.user = fastify.jwt.verify(token);
    // } catch (e) {
    //   connection.close();
    //   console.log('Rozłączono z powodu braku JWT');
    //   return;
    // }

    let playerRole = 'spectator';

    if (!leftPlayer) {
      leftPlayer = connection;
      playerRole = 'left';
      console.log('Gracz lewy dołączył');
    } else if (!rightPlayer) {
      rightPlayer = connection;
      playerRole = 'right';
      console.log('Gracz prawy dołączył');
    } else {
      spectators.add(connection);
      console.log('Dołączył obserwator');
    }

    clients.add(connection);

    connection.send(JSON.stringify({
      type: 'role',
      role: playerRole
    }));

    connection.send(JSON.stringify({
      type: 'gameState',
      data: {
        score: score,
        leftPaddleY: leftPaddleY,
        rightPaddleY: rightPaddleY
      }
    }));

    connection.on('message', message => {
      const msg = message.toString().trim();
      console.log(`Otrzymana wiadomość od ${playerRole}:`, msg);

      if (playerRole === 'left') {
        if (msg === 'UP') {
          leftPaddleY = Math.max(0, leftPaddleY - 20);
          broadcastGameState();
        } else if (msg === 'DOWN') {
          leftPaddleY = Math.min(340, leftPaddleY + 20);
          broadcastGameState();
        }
      } else if (playerRole === 'right') {
        if (msg === 'UP') {
          rightPaddleY = Math.max(0, rightPaddleY - 20);
          broadcastGameState();
        } else if (msg === 'DOWN') {
          rightPaddleY = Math.min(340, rightPaddleY + 20);
          broadcastGameState();
        }
      }
    });

    connection.on('close', () => {
      console.log(`Połączenie ${playerRole} zamknięte`);

      if (connection === leftPlayer) {
        leftPlayer = null;
        console.log('Gracz lewy opuścił grę');
      } else if (connection === rightPlayer) {
        rightPlayer = null;
        console.log('Gracz prawy opuścił grę');
      } else {
        spectators.delete(connection);
      }
    });

    connection.on('error', (err) => {
      console.error('WebSocket error:', err);
      clients.delete(connection);

      if (connection === leftPlayer) leftPlayer = null;
      else if (connection === rightPlayer) rightPlayer = null;
      else spectators.delete(connection);
    });
  });
}

function broadcastGameState() {
  broadcast(JSON.stringify({
    type: 'gameState',
    data: {
      score,
      leftPaddleY,
      rightPaddleY,
      ballX,
      ballY
    }
  }));
}

function broadcast(message) {
  for (const client of clients) {
    try {
      client.send(message);
    } catch (err) {
      console.error('Błąd przy wysyłaniu:', err);
    }
  }
}

setInterval(() => {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY - ballRadius < 0 || ballY + ballRadius > canvasHeight) {
    ballSpeedY = -ballSpeedY;
  }

  if (
    ballX - ballRadius < 20 &&
    ballY > leftPaddleY &&
    ballY < leftPaddleY + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX;
  }

  if (
    ballX + ballRadius > canvasWidth - 20 &&
    ballY > rightPaddleY &&
    ballY < rightPaddleY + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX;
  }

  if (ballX < 0 || ballX > canvasWidth) {
    ballX = canvasWidth / 2;
    ballY = canvasHeight / 2;
    ballSpeedX = 3 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 2 * (Math.random() > 0.5 ? 1 : -1);
  }

  broadcastGameState();
}, 20);

export default gameRoutes;
