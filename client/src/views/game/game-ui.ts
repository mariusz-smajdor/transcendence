import { Container } from '../../components/container';
import { Text } from '../../components/text';
import { Button } from '../../components/button';
import {
	GameState,
	UIElements,
	UIActions,
	GameUI,
	GameType,
} from '../../types/game';

export function createGameUI(gameType: GameType): GameUI {
	const game = Container({
		element: 'main',
		classes: [
			'flex',
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

	const gameState: GameState = {
		leftPaddleY: 0.425,
		rightPaddleY: 0.425,
		ballX: 0.5,
		ballY: 0.5,
		scoreLeft: 0,
		scoreRight: 0,
		playerRole: 'spectator',
		gameOver: false,
		leftPlayerName: 'Left',
		rightPlayerName: 'Right',
	};

	const paddleWidth = 0.016;
	const paddleHeight = 0.15;
	const ballRadius = 0.025;

	const text = Text({ content: 'Connecting to server...' });
	const roleText = Text({ content: 'Role: waiting...' });

	const canvas = document.createElement('canvas');
	canvas.classList.add('canvas-glow');

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('Could not get 2D context from canvas');
	}

	const restartBtn = Button({
		content: 'Rematch',
		classes: [
			'mt-4',
			'px-4',
			'py-2',
			'rounded',
			'bg-primary',
			'text-white',
			'font-bold',
			'shadow',
		],
	});
	restartBtn.style.display = 'none';

	game.appendChild(canvas);
	game.appendChild(restartBtn);
	game.appendChild(text);
	if (gameType === 'network') {
		game.appendChild(roleText);
	}

	function drawScene(): void {
		const w = canvas.width;
		const h = canvas.height;

		if (ctx === null) {
			return;
		}

		//background
		const gradient = ctx!.createLinearGradient(0, 0, w, h);
		gradient.addColorStop(0, '#E879F9');
		gradient.addColorStop(1, '#312e81');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, w, h);

		//paddles
		ctx.fillStyle = 'black';
		ctx.fillRect(
			(10 / 600) * w,
			gameState.leftPaddleY * h,
			paddleWidth * w,
			paddleHeight * h
		);
		ctx.fillRect(
			(580 / 600) * w,
			gameState.rightPaddleY * h,
			paddleWidth * w,
			paddleHeight * h
		);

		//ball
		ctx.beginPath();
		ctx.arc(
			gameState.ballX * w,
			gameState.ballY * h,
			ballRadius * h,
			0,
			Math.PI * 2
		);
		ctx.fill();

		//player names
		ctx.font = 'bold 16px Poppins, sans-serif, Arial';
		ctx.fillStyle = '#312e81'; // granatowy
		ctx.textAlign = 'start';
		ctx.fillText(`${gameState.leftPlayerName}`, 0.02 * w, 0.05 * h);

		ctx.textAlign = 'end';
		ctx.fillStyle = '#E879F9'; // różowy
		ctx.fillText(`${gameState.rightPlayerName}`, 0.98 * w, 0.05 * h);
		ctx.textAlign = 'start'; // reset

		//score
		ctx.save();
		ctx.font = `bold ${Math.floor(h * 0.12)}px Poppins, sans-serif, Arial`;
		ctx.fillStyle = '#fff';
		ctx.textAlign = 'center';
		ctx.shadowColor = '#E879F9';
		ctx.shadowBlur = 16;
		ctx.fillText(
			`${gameState.scoreLeft} : ${gameState.scoreRight}`,
			w / 2,
			0.15 * h
		);
		ctx.shadowBlur = 0;
		ctx.restore();

		//highlite player's paddle
		if (gameState.playerRole === 'left') {
			ctx.save();
			ctx.strokeStyle = '#312e81';
			ctx.lineWidth = 4;
			ctx.shadowColor = '#312e81';
			ctx.shadowBlur = 12;
			ctx.strokeRect(
				(10 / 600) * w - 4,
				gameState.leftPaddleY * h - 4,
				paddleWidth * w + 8,
				paddleHeight * h + 8
			);
			ctx.restore();
		} else if (gameState.playerRole === 'right') {
			ctx.save();
			ctx.strokeStyle = '#E879F9';
			ctx.lineWidth = 4;
			ctx.shadowColor = '#E879F9';
			ctx.shadowBlur = 12;
			ctx.strokeRect(
				(580 / 600) * w - 4,
				gameState.rightPaddleY * h - 4,
				paddleWidth * w + 8,
				paddleHeight * h + 8
			);
			ctx.restore();
		}

		if (gameState.gameOver) {
			ctx.save();
			ctx.font = `bold ${Math.floor(h * 0.13)}px Poppins, sans-serif, Arial`;
			ctx.fillStyle = '#fff';
			ctx.textAlign = 'center';
			ctx.shadowColor = '#E879F9';
			ctx.shadowBlur = 20;
			ctx.fillText(
				`${
					gameState.scoreLeft > gameState.scoreRight ? 'LEFT' : 'RIGHT'
				} WINNER`,
				w / 2,
				h / 2
			);
			ctx.restore();
			if (gameType !== 'tournament') {
				restartBtn.style.display = '';
			}
		} else {
			restartBtn.style.display = 'none';
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

	const ui: UIElements = {
		game,
		text,
		roleText,
		restartBtn,
	};

	const actions: UIActions = {
		drawScene,
		resizeCanvas,
	};

	return { ui, gameState, actions };
}
