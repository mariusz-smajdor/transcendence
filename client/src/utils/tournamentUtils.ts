// Tournament utility functions

export async function fetchTournamentRooms(
	token: string | null,
	sessionId: string | null
) {
	const response = await fetch('http://localhost:3000/tournament/rooms', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token, sessionId }),
	});
	return await response.json();
}

export async function leaveRoom(
	roomId: string | null,
	token: string | null,
	sessionId: string | null
) {
	const response = await fetch('http://localhost:3000/tournament/leave', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ roomId, token, sessionId }),
	});
	return response.ok;
}

export function showPopupMessage(message: string, duration: number = 3000) {
	const oldPopup = document.getElementById('popup-message');
	if (oldPopup) oldPopup.remove();

	const popup = document.createElement('div');
	popup.id = 'popup-message';
	popup.textContent = message;

	popup.className = `
        fixed top-8 left-1/2 transform -translate-x-1/2 z-[9999]
        px-6 py-3 rounded-lg font-bold shadow-2xl
        bg-primary text-white border-2 border-primary
        transition-opacity duration-500
    `;

	document.body.appendChild(popup);

	setTimeout(() => {
		popup.style.opacity = '0';
		setTimeout(() => popup.remove(), 500);
	}, duration);
}
