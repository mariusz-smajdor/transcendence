import { Container } from '../../components/container';
import { Text } from '../../components/text';

type GameUI = {
    game: HTMLElement;
    canvas: HTMLCanvasElement;
    text: HTMLElement;
    roleText: HTMLElement;
    // ctx: CanvasRenderingContext2D | null;
};

export function createGameUI(): GameUI {
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

    game.appendChild(text);
    game.appendChild(roleText);

    return { game, canvas, text, roleText };
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

export function drawScene(): void {
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

export function resizeCanvas() {
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