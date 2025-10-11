import { Button } from '../../components/button';
import { Text } from '../../components/text';
import Game from './game';
import { GameType } from '../../types/game';
import { cleanupKeyboardState } from './game-keys';

export function showGameOverlay(
	gameId: string,
	gameType: GameType,
	roomId: string | null = null
) {
	const gameComponentResult = Game(gameId, gameType, roomId);
	if (!gameComponentResult?.game || !gameComponentResult?.ws) {
		console.error('Failed to initialize game');
		return;
	}

	const gameWebSocket = gameComponentResult?.ws;
	const gameElementForDOM = gameComponentResult?.game;

	const overlay = document.createElement('div');

	overlay.classList.add(
		'fixed',
		'inset-0',
		'bg-black/70',
		'flex',
		'items-center',
		'justify-center',
		'z-50'
	);
	overlay.id = 'game-modal';
	// Keep a reference to ws on the overlay for cleanup when navigating back
	(overlay as any).__ws = gameWebSocket;

	const CloseBtn = Button({
		content: '✕',
		variant: 'outline',
		classes: [
			'absolute',
			'top-4',
			'right-6',
			'text-white',
			'bg-transparent',
			'border-none',
			'cursor-pointer',
		],
	});

	CloseBtn.style.fontSize = '2rem';
	CloseBtn.onclick = () => {
		closeGameOverlay();
		window.history.pushState(null, '', '/');
	};

	const shareText = Text({
		content: 'share with a friend: ',
		classes: [
			'absolute',
			'bottom-2',
			'left-1/2',
			'-translate-x-1/2',
			'text-white',
			'text-md',
			'px-4',
			'py-2',
			'rounded',
			'text-center',
			'flex',
			'items-center',
			'gap-2',
		],
	});

	const gameUrl = `${window.location.origin}/game?gameId=${gameId}`;
	const link = document.createElement('a');
	link.href = '#';
	link.textContent = 'copy link';
	link.classList.add('text-blue-400', 'underline', 'hover:text-blue-200');

	link.onclick = async (e) => {
		e.preventDefault();
		try {
			await navigator.clipboard.writeText(gameUrl);
			const oldText = link.textContent;
			link.textContent = 'copied!';
			setTimeout(() => {
				link.textContent = oldText;
			}, 1500);
		} catch {
			link.textContent = 'error';
		}
	};

	window.addEventListener('keydown', preventArrowScroll, { passive: false });
	document.body.appendChild(overlay);
	if (gameElementForDOM) {
		overlay.appendChild(gameElementForDOM);
	} else {
		console.error('Failed to create game component.');
	}
	overlay.appendChild(CloseBtn);
	if (gameType === 'network') {
		overlay.appendChild(shareText);
		shareText.appendChild(link);
	}
}

export function closeGameOverlay() {
	const overlay = document.getElementById('game-modal') as HTMLElement | null;
	if (!overlay) return;

	// Remove keydown prevention and cleanup keyboard handlers
	window.removeEventListener('keydown', preventArrowScroll);
	cleanupKeyboardState();

	// Close any associated WebSocket if present
	const ws = (overlay as any).__ws as WebSocket | undefined;
	if (ws && ws.readyState === WebSocket.OPEN) {
		ws.close();
	}

	overlay.remove();
}

function preventArrowScroll(e: KeyboardEvent) {
	if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
		e.preventDefault();
	}
}
