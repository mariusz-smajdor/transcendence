import { Container } from '../components/container';
import { Text } from '../components/text';

export default function Game() {
	const game = Container({
		element: 'main',
		classes: ['flex',
			'h-screen',
			'mt-8',
			'flex-col',
			'items-center',
			'max-w-4xl',
			'w-full',
			'px-4',
			'min-w-[320px]',
			'min-h-[300px]',
		],
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

	const text = Text({ content: 'Connecting to server...' });
	const roleText = Text({ content: 'Role: waiting...' });

	const canvas = document.createElement('canvas');
	canvas.classList.add('canvas-glow');
	game.appendChild(canvas);


	const ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('Nie udało się pobrać kontekstu 2D z canvas');
		return game;
	}

	const paddleWidth = 0.016;	// 10/600
	const paddleHeight = 0.15;	// 60/400
	const ballRadius = 0.025;	// 10/400 

	let leftPaddleY = 0.425;		// 170/400
	let rightPaddleY = 0.425;
	let ballX = 0.5;				
	let ballY = 0.5;

	let scoreLeft = 0;
	let scoreRight = 0;

	let playerRole = 'spectator';

	function drawScene(): void {
		const w = canvas.width;
		const h = canvas.height;

		//background 
	    const gradient = ctx.createLinearGradient(0, 0, w, h);
		gradient.addColorStop(0, "#E879F9");
		gradient.addColorStop(1, "#312e81");
		ctx.fillStyle = gradient;
    	ctx.fillRect(0, 0, w, h);
		
		//paddles
		ctx.fillStyle = 'black';
		ctx.fillRect(10 / 600 * w, leftPaddleY * h, paddleWidth * w, paddleHeight * h);
		ctx.fillRect(580 / 600 * w, rightPaddleY * h, paddleWidth * w, paddleHeight * h);

		//ball
		ctx.beginPath();
		ctx.arc(ballX * w, ballY * h, ballRadius * h, 0, Math.PI * 2);
		ctx.fill();

		//player names
	    ctx.font = 'bold 16px Poppins, sans-serif, Arial';
		ctx.fillStyle = '#312e81'; // granatowy
		ctx.textAlign = 'start';
		ctx.fillText('Left', 0.02 * w, 0.05 * h);
		
		ctx.textAlign = 'end';
		ctx.fillStyle = '#E879F9'; // różowy
		ctx.fillText('Right', 0.98 * w, 0.05 * h);
		ctx.textAlign = 'start'; // reset

		//score
		ctx.save();
		ctx.font = `bold ${Math.floor(h * 0.12)}px Poppins, sans-serif, Arial`;
		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.shadowColor = '#E879F9';
		ctx.shadowBlur = 16;
		ctx.fillText(`${scoreLeft} : ${scoreRight}`, w / 2, 0.15 * h);
		ctx.shadowBlur = 0;
		ctx.restore();
		
		//highlite player's paddle 
		if (playerRole === 'left') {
			ctx.save();
			ctx.strokeStyle = '#312e81';
			ctx.lineWidth = 4;
			ctx.shadowColor = '#312e81';
			ctx.shadowBlur = 12;
			ctx.strokeRect(10 / 600 * w - 4, leftPaddleY * h - 4, paddleWidth * w + 8, paddleHeight * h + 8);
			ctx.restore();
		} else if (playerRole === 'right') {
			ctx.save();
			ctx.strokeStyle = '#E879F9';
			ctx.lineWidth = 4;
			ctx.shadowColor = '#E879F9';
			ctx.shadowBlur = 12;
			ctx.strokeRect(580 / 600 * w - 4, rightPaddleY * h - 4, paddleWidth * w + 8, paddleHeight * h + 8);
			ctx.restore();
		}
	}

	function resizeCanvas() {
		const rect = game.getBoundingClientRect();
		const aspectRatio = 3 / 2;
		let width = rect.width;
		let height = rect.height;
		if (width / height > aspectRatio) {
			width = height * aspectRatio;
		} else {
			height = width / aspectRatio;
		}
		canvas.width = Math.floor(width);
		canvas.height = Math.floor(height);

		drawScene();
	}

	requestAnimationFrame(() => {
		resizeCanvas();
	});
	window.addEventListener('resize', resizeCanvas);


	//websocket 
	const gameId = new URLSearchParams(window.location.search).get('gameId');
	const ws: WebSocket = new WebSocket(`ws://localhost:3000/game?gameId=${gameId}`);

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
					roleText.textContent = 'Role: Left player (controls: W/S)';
				} else if (playerRole === 'right') {
					roleText.textContent = 'Role: Right player (controls: ↑/↓)';
				} else {
					roleText.textContent = 'Role: Spectator';
				}

				text.textContent = 'Connected to server!';
			}

			else if (data.type === 'gameState') {
				leftPaddleY = data.data.paddles.left;
				rightPaddleY = data.data.paddles.right;
				ballX = data.data.ball.x;
				ballY = data.data.ball.y;
				scoreLeft = data.data.score.left;
				scoreRight = data.data.score.right;
				drawScene();
			}

			else if (data.type === 'error') {
				console.error(data.message);
			}

      else if (data.type === 'message') {
        text.textContent = data.message;
      }
      
		} catch (e) {
			console.error('Error parsing JSON:', e);
			text.textContent = event.data;
		}
	};

	ws.onopen = () => {
		text.textContent = 'Connected to server. Waiting for role assignment...';
	};

	ws.onclose = () => {
		text.textContent = 'Disconnected from server!';
		roleText.textContent = 'Role: disconnected';
	};

	game.appendChild(text);
	game.appendChild(roleText);

	return game;
}