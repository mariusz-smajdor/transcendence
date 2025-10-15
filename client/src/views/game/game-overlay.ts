import { Button } from '../../components/button';
import Game from './game';
import { GameType } from '../../types/game';
import { cleanupKeyboardState } from './game-keys';
import { historyManager } from '../../utils/historyManager';

export function showGameOverlay(
	gameId: string,
	gameType: GameType,
	roomId: string | null = null
) {
	// Prevent multiple game overlays from being opened
	const existingOverlay = document.getElementById('game-modal');
	if (existingOverlay) {
		console.log('Game overlay already exists, closing existing one');
		closeGameOverlay();
	}

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

		if (gameType === 'tournament') {
			// For tournament games, restore the previous state to stay on tournament tab
			const currentState = historyManager.getCurrentState();
			const previousState = currentState?.data?.previousState;

			if (previousState) {
				// Restore the previous state (likely the tournament tab state)
				historyManager.replaceState(previousState.type, previousState.data);
			} else {
				// Fallback: just go back
				historyManager.back();
			}
		} else {
			// For non-tournament games, go back in history normally
			historyManager.back();
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

	// Push history state for back button support
	// For tournament games, store the previous state so we can restore it
	if (gameType === 'tournament') {
		const previousState = historyManager.getCurrentState();
		historyManager.pushState('game', { gameId, gameType, previousState });
	} else {
		historyManager.pushState('game', { gameId, gameType });
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
