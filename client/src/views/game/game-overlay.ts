import { Button } from '../../components/button';
import { Text } from '../../components/text';
import Game from './game';
import { GameType } from '../../types/game';

export function showGameOverlay(gameId: string, gameType: GameType) {

    const gameComponentResult = Game(gameId, gameType);
    if (!gameComponentResult?.game || !gameComponentResult?.ws) {
        console.error("Failed to initialize game");
        return;
    }

    const gameWebSocket = gameComponentResult?.ws;
    const gameElementForDOM = gameComponentResult?.game;

    const overlay = document.createElement('div');

    overlay.classList.add(
        'fixed', 'inset-0', 'bg-black/70', 'flex', 'items-center', 'justify-center', 'z-50'
    );
    overlay.id = 'game-modal';

    const CloseBtn = Button({
        content: '✕',
        variant: 'outline',
        classes: [
            'absolute', 'top-4', 'right-6', 'text-white', 'bg-transparent', 'border-none', 'cursor-pointer'
        ],
    });

    CloseBtn.style.fontSize = '2rem';
    CloseBtn.onclick = () => {
        if (gameWebSocket && gameWebSocket.readyState === WebSocket.OPEN) {
            gameWebSocket.close();
        }
        overlay.remove();
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
            'gap-2'
        ]
    });

    const gameUrl = `${window.location.origin}/game?gameId=${gameId}`;
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'copy link';
    link.classList.add(
        'text-blue-400',
        'underline',
        'hover:text-blue-200',
    );

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