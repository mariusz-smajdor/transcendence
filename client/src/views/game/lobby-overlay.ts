import { MessageSquarePlus, MessageSquareMore } from 'lucide';
import { getFriends } from '../../api/friendRequest';
import { store } from '../../store';
import { Button } from '../../components/button';
import { Text } from '../../components/text';
import { Img } from '../../components/img';
import { Wrapper } from '../../components/wrapper';
import { Icon } from '../../components/icon';
import { sendInvitation, onInvitation } from '../../api/invitationSocket';
import { showGameOverlay } from './game-overlay';

export async function showLobbyOverlay() {

    await getFriends();
    const user = store.getState().user;
    const friends = user?.friends || [];
    let invitedFriendId: number | null = null;

    const overlay = document.createElement('div');
    overlay.classList.add(
        'fixed', 'inset-0', 'bg-black/70', 'flex', 'items-center', 'justify-center', 'z-50'
    );
    overlay.id = 'friends-modal';

    const container = document.createElement('div');
    container.classList.add(
        'flex', 'flex-col', 'bg-foreground', 'rounded', 'p-6', 'min-w-[40vw]', 'min-h-[50vh]', 'max-h-[70vh]', 'overflow-y-auto', 'relative'
    );

    const wrapper = Wrapper({ classes: ['flex', 'justify-between', 'items-center', 'mb-4'] });

    const header = Text({
        content: 'Inivite friend to a game',
        classes: ['text-lg', 'font-bold', 'text-center'],
    });

    const closeBtn = Button({
        content: '✕',
        variant: 'outline',
        classes: [
            'text-white', 'bg-transparent', 'border-none', 'cursor-pointer', 'text-3xl'
        ],
    });
    closeBtn.onclick = () => {
        if (invitedFriendId != null)
            sendInvitation({ type: 'uninvite', message: 'Deactivate invitation', toUserId: invitedFriendId });
        unsubscribe();
        overlay.remove();
    }

    wrapper.appendChild(header);
    wrapper.appendChild(closeBtn);
    container.appendChild(wrapper);

    const friendsWrapper = Wrapper({ classes: ['border', 'border-accent', 'rounded', 'p-4', 'w-full', 'h-full', 'flex-1'] })
    container.appendChild(friendsWrapper);

    if (friends.length === 0) {
        friendsWrapper.appendChild(
            Text({ content: 'No friends found. You need to add a friend first.', classes: ['text-muted', 'text-center', 'py-4'] })
        );
    } else {
        friends.forEach((f: any) => {
            const row = document.createElement('div');
            row.classList.add('flex', 'items-center', 'gap-3', 'mb-3', 'hover:bg-background/25');
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

            const inviteIcon = Icon({
                icon: MessageSquarePlus,
                size: 'sm',
                strokeWidth: 2.5,
            });

            const inviteBtn = Button({
                variant: 'primary',
                classes: ['ml-auto', 'flex', 'items-center', 'gap-2'],
            });
            inviteBtn.appendChild(inviteIcon);
            inviteBtn.appendChild(document.createTextNode('Invite'));

            inviteBtn.onclick = () => {
                if (invitedFriendId == null) {
                    sendInvitation({ type: 'invite', message: 'Invitation send', toUserId: f.id });
                    invitedFriendId = f.id;
                    inviteBtn.textContent = '';

                    const invitedIcon = Icon({
                        icon: MessageSquareMore,
                        size: 'sm',
                        strokeWidth: 2.5,
                    });

                    inviteBtn.appendChild(invitedIcon);
                    inviteBtn.appendChild(document.createTextNode('Invited'));
                    inviteBtn.disabled = true;

                    setTimeout(() => {
                        sendInvitation({ type: 'uninvite', message: 'Deactivate invitation', toUserId: f.id });
                        invitedFriendId = null;
                        inviteBtn.textContent = '';
                        inviteBtn.appendChild(inviteIcon);
                        inviteBtn.appendChild(document.createTextNode('Invite'));
                        inviteBtn.disabled = false;
                    }, 30000);
                }
            };

            row.appendChild(avatar);
            row.appendChild(name);
            row.appendChild(inviteBtn);
            friendsWrapper.appendChild(row);
        });
    }

    const unsubscribe = onInvitation(async (data) => {
        if (data.type === 'game_start' && data.fromUserId) {
            const response = await fetch('http://localhost:3000/game/create');
            const respData = await response.json();
            sendInvitation({ type: 'game_start', message: 'Game started', toUserId: data.fromUserId, gameId: respData.gameId });
            overlay.remove();
            showGameOverlay(respData.gameId, 'network');
            const newUrl = `/game?gameId=${respData.gameId}`;
            history.pushState({ gameId: respData.gameId }, `Game ${respData.gameId}`, newUrl);

            unsubscribe();
        }
    });

    overlay.appendChild(container);
    document.body.appendChild(overlay);
}