import { Container } from '../components/container';
import { Text } from '../components/text';

export default function Game() {
    const game = Container({
        element: 'main',
        classes: ['h-screen', 'flex', 'flex-col', 'items-center', 'justify-center'],
    });

    // function getCookie(name: string): string | null {
    //   const value = `; ${document.cookie}`;
    //   const parts = value.split(`; ${name}=`);
    //   if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
    //   return null;
    // }
    
    // const token = getCookie('access_token');
    // if (!token) {
    //   const info = text({ content: 'Musisz być zalogowany, by grać'})
    //   game.appendChild(info);
    //   setTimeout(() => {
    //     window.location.href = '/';
    //   }, 2000);
    //   return game;
    // }

    const text = Text({ content: 'Łączenie z serwerem...' });
    const roleText = Text({ content: 'Rola: oczekiwanie...' });

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    canvas.style.border = '1px solid black';
    game.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Nie udało się pobrać kontekstu 2D z canvas');
      return game;
    }

    const paddleWidth = 10;
    const paddleHeight = 60;
    const ballRadius = 10;
  
    let leftPaddleY = 170;
    let rightPaddleY = 170;
    let ballX = 300;
    let ballY = 200;

    let playerRole = 'spectator';

    function drawScene(): void {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'black';
      ctx.fillRect(10, leftPaddleY, paddleWidth, paddleHeight);
      ctx.fillRect(580, rightPaddleY, paddleWidth, paddleHeight);

      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = '14px Arial';
    ctx.fillText('Gracz 1', 10, 20);
    ctx.fillText('Gracz 2', 540, 20);
    

    if (playerRole === 'left') {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, leftPaddleY - 2, paddleWidth + 4, paddleHeight + 4);
    } else if (playerRole === 'right') {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(578, rightPaddleY - 2, paddleWidth + 4, paddleHeight + 4);
    }

    drawScene();

    const ws: WebSocket = new WebSocket(`ws://localhost:3000/game`);
    
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (playerRole === 'left') {
        if (e.key === 'w' || e.key === 'W') {
          ws.send('UP');
        } 
        if (e.key === 's' || e.key === 'S') {
          ws.send('DOWN');
        }
      } 
      else if (playerRole === 'right') {
        if (e.key === 'ArrowUp') {
          ws.send('UP');
        } 
        if (e.key === 'ArrowDown') {
          ws.send('DOWN');
        }
      }
    });
    
    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        

        if (data.type === 'role') {
          playerRole = data.role;
          
          if (playerRole === 'left') {
            roleText.textContent = 'Rola: Gracz lewy (sterowanie: W/S)';
          } else if (playerRole === 'right') {
            roleText.textContent = 'Rola: Gracz prawy (sterowanie: ↑/↓)';
          } else {
            roleText.textContent = 'Rola: Obserwator';
          }
          
          text.textContent = 'Połączono z serwerem!';
        } 

        else if (data.type === 'gameState') {
          leftPaddleY = data.data.paddles.left;
          rightPaddleY = data.data.paddles.right;
          ballX = data.data.ball.x;
          ballY = data.data.ball.y;
          drawScene();
        }

        else if (data.type === 'error') {
          console.error(data.message);
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
        text.textContent = event.data;
      }
    };

    ws.onopen = () => {
      text.textContent = 'Połączono z serwerem. Oczekiwanie na przydzielenie roli...';
    };

    ws.onclose = () => {
      text.textContent = 'Rozłączono z serwerem!';
      roleText.textContent = 'Rola: rozłączono';
    };

    game.appendChild(text);
    game.appendChild(roleText);

    return game;
}