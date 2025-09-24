import { Tab } from '../../../components/tabs';
import { getCookie } from '../../game/game-cookies.js';
import {
	fetchTournamentRooms,
	leaveRoom,
	showPopupMessage,
} from '../../../utils/tournamentUtils.js';
import { TournamentList } from './components/TournamentList';
import { TournamentCreateForm } from './components/TournamentCreateForm';
import { TournamentBracket } from './components/TournamentBracket';

let currentRoomId: string | null = null;

export function TournamentTab() {
	const tab = Tab({
		value: 'tournament',
	});

	let currentCard: HTMLElement | null = null;

	async function renderTournamentList() {
		const token = getCookie('access_token') ?? null;
		const sessionId = getCookie('sessionId') ?? null;

		const tournamentList = TournamentList({
			onCreateTournament: () => renderCreateForm(),
			onJoinTournament: async (room) => {
				try {
					const response = await fetch(
						'http://localhost:3000/tournament/join',
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								name: 'Player',
								token,
								sessionId,
								roomId: room.id,
							}),
						}
					);

					const data = await response.json();
					if (response.ok) {
						showPopupMessage('Successfully joined tournament!');
						currentRoomId = room.id;
						renderBracket(data.playersExpected, data.playersIn, data);
					} else {
						showPopupMessage(data.error || 'Failed to join tournament');
					}
				} catch (error) {
					console.error('Error joining tournament:', error);
					showPopupMessage('Network error. Please try again.');
				}
			},
			onRefresh: async () => {
				const rooms = await fetchTournamentRooms(token, sessionId);
				if (rooms.found && rooms.id) {
					currentRoomId = rooms.id;
					renderBracket(rooms.playersExpected, rooms.playersIn, rooms);
				} else {
					currentRoomId = null;
					const tournaments = Array.isArray(rooms) ? rooms : [rooms];
					(tournamentList as any).renderRooms(tournaments);
				}
			},
		});

		// Initial load
		const rooms = await fetchTournamentRooms(token, sessionId);
		if (rooms.found && rooms.id) {
			currentRoomId = rooms.id;
			renderBracket(rooms.playersExpected, rooms.playersIn, rooms);
		} else {
			currentRoomId = null;
			const tournaments = Array.isArray(rooms) ? rooms : [rooms];
			(tournamentList as any).renderRooms(tournaments);
		}

		currentCard = tournamentList;
		tab.innerHTML = '';
		tab.appendChild(currentCard);

		// Auto-refresh every 2 seconds
		setInterval(async () => {
			const rooms = await fetchTournamentRooms(token, sessionId);
			if (rooms.found && rooms.id) {
				currentRoomId = rooms.id;
				renderBracket(rooms.playersExpected, rooms.playersIn, rooms);
			} else {
				currentRoomId = null;
				const tournaments = Array.isArray(rooms) ? rooms : [rooms];
				(tournamentList as any).renderRooms(tournaments);
			}
		}, 2000);
	}

	function renderCreateForm() {
		const createForm = TournamentCreateForm({
			onCancel: () => renderTournamentList(),
			onCreate: () => {
				// Tournament creation is handled in the form component
				// We just need to show the bracket after creation
				renderTournamentList();
			},
		});

		currentCard = createForm;
		tab.innerHTML = '';
		tab.appendChild(currentCard);
	}

	function renderBracket(
		numberOfPlayers: number,
		playersIn: number,
		response: any
	) {
		const bracket = TournamentBracket({
			numberOfPlayers,
			playersIn,
			players: response.positions ?? [],
			matches: response.matches ?? [],
			roomId: currentRoomId,
			onLeave: async () => {
				const token = getCookie('access_token') ?? null;
				const sessionId = getCookie('sessionId') ?? null;
				if (await leaveRoom(currentRoomId, token, sessionId)) {
					await renderTournamentList();
				}
			},
		});

		currentCard = bracket;
		tab.innerHTML = '';
		tab.appendChild(currentCard);
	}

	renderTournamentList();
	return tab;
}
