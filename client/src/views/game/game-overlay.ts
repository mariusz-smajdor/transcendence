import { Button } from '../../components/button';
import { Text } from '../../components/text';
import Game from './game';

export function showGameOverlay(gameId: string) {
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
        const ws = (gameComponent as any).ws;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
        overlay.remove();
        window.history.pushState(null, '', '/');
    };
    overlay.appendChild(CloseBtn);

    const gameComponent = Game({ gameId });
    overlay.appendChild(gameComponent);

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
    link.href = gameUrl;
    link.textContent = 'copy link';
    link.target = '_blank';
    link.classList.add(
        'text-blue-400',
        'underline',
        'hover:text-blue-200',
    );

    shareText.appendChild(link);
    overlay.appendChild(shareText);

    document.body.appendChild(overlay);
}