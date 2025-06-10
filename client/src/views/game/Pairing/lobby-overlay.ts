import { getFriends } from '../../../api/friendRequest';
import { store } from '../../../store';
import { Button } from '../../../components/button';
import { Text } from '../../../components/text';
import { Img } from '../../../components/img';
import { sendInvitation, onInvitation } from '../../../api/invitationSocket';
import { showGameOverlay } from '../game-overlay';

export async function showLobbyOverlay() {

    await getFriends();
    const user = store.getState().user;
    const friends = user?.friends || [];

    const overlay = document.createElement('div');
    overlay.classList.add(
        'fixed', 'inset-0', 'bg-black/70', 'flex', 'items-center', 'justify-center', 'z-50'
    );
    overlay.id = 'friends-modal';

    const container = document.createElement('div');
    container.classList.add(
        'bg-background', 'rounded', 'p-6', 'min-w-[30vw]', 'min-h-[30vh]', 'max-h-[70vh]', 'overflow-y-auto', 'relative'
    );

    const header = Text({
        content: 'Inivite friend to a game',
        classes: ['text-lg', 'font-bold', 'mb-4', 'text-center'],
    });
    container.appendChild(header);

    if (friends.length === 0) {
        container.appendChild(
            Text({ content: 'No friends found.', classes: ['text-muted', 'text-center', 'py-4'] })
        );
    } else {
        friends.forEach((f: any) => {
            const row = document.createElement('div');
            row.classList.add('flex', 'items-center', 'gap-3', 'mb-3');
            const avatar = Img({
                src: f.avatar || `https://i.pravatar.cc/30${f.id}`,
                alt: f.username,
                width: 35,
                height: 35,
                classes: ['rounded-full', 'border', 'border-accent'],
            });
            const name = Text({
                element: 'span',
                content: f.username,
                classes: ['text-base'],
            });

            const inviteBtn = Button({
                content: 'Invite',
                variant: 'primary',
                classes: ['ml-auto'],
            });

            inviteBtn.onclick = () => {
                sendInvitation({ type: 'invite', message: 'Invitation send', toUserId: f.id });
                inviteBtn.textContent = 'Invited';
                inviteBtn.disabled = true;
            };

            row.appendChild(avatar);
            row.appendChild(name);
            row.appendChild(inviteBtn);
            container.appendChild(row);
        });
    }

    const closeBtn = Button({
        content: '✕',
        variant: 'outline',
        classes: [
            'absolute', 'top-2', 'right-4', 'text-white', 'bg-transparent', 'border-none', 'cursor-pointer'
        ],
    });
    closeBtn.style.fontSize = '1.5rem';
    closeBtn.onclick = () => overlay.remove();

    onInvitation(async (data) => {
        if (data.type === 'game_start' && data.fromUserId) {
            const response = await fetch('http://localhost:3000/game/create');
            const respData = await response.json();
            sendInvitation({ type: 'game_start', message: 'Game started', toUserId: data.fromUserId, gameId: respData.gameId });
            showGameOverlay(respData.gameId, 'network');
            const newUrl = `/game?gameId=${respData.gameId}`;
            history.pushState({ gameId: respData.gameId }, `Game ${respData.gameId}`, newUrl);
        }
    });

    container.appendChild(closeBtn);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
}