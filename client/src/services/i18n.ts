import { getCurrentLang, onLanguageChange } from './languageService';

type Dict = Record<string, string>;
type Translations = Record<string, Dict>;

// Initial demo translations. Extend/replace as needed.
const translations: Translations = {
	en: {
		// Header
		'header.language': 'Language',
		'header.profile': 'Profile',
		'header.logout': 'Logout',
		'languages.en': 'English',
		'languages.pl': 'Polski',
		'languages.es': 'Español',

		// Auth
		'auth.authenticate': 'Authenticate',
		'auth.google': 'Authenticate with Google',
		'auth.tabs.login': 'Login',
		'auth.tabs.register': 'Register',
		'login.heading': 'Welcome back!',
		'login.username.label': 'Username:',
		'login.username.placeholder': 'your username',
		'login.password.label': 'Password:',
		'login.password.placeholder': '********',
		'login.totp.label': '2FA Code:',
		'login.totp.placeholder': '123456',
		'login.submit': 'Sign in',
		'login.2fa.prompt': 'Please enter your 2FA code',
		'login.success': 'Login successful!',
		'login.unknownError': 'An unknown error occurred. Please try again.',

		'register.heading': 'Create your account!',
		'register.email.label': 'Email address:',
		'register.email.placeholder': 'example@email.com',
		'register.username.label': 'Username:',
		'register.username.placeholder': 'your username',
		'register.password.label': 'Password:',
		'register.password.placeholder': '********',
		'register.confirmPassword.label': 'Confirm Password:',
		'register.confirmPassword.placeholder': '********',
		'register.success':
			'Registration successful! Scan the QR code with your authenticator app.',
		'register.qr.alt': '2FA QR Code',
		'register.submit': 'Sign up',

		// Home/Friends
		'home.friends.heading': 'Friends',
		'friends.noRequests': 'No friend requests',
		'friends.search.placeholder': 'Search friends...',
		'friends.add': 'Add',
		'friends.addByUsernamePlaceholder': 'Add friend by username...',
		'friends.allFriends': 'All Friends',
		'friends.requests': 'Requests',
		'friends.blocked': 'Blocked',
		'friends.noBlockedUsers': 'No blocked users',

		// Messages
		'messages.noMessages': 'No messages yet. Start the conversation!',
		'messages.input.placeholder': 'Type a message...',
		'messages.send': 'Send',

		// History
		'history.heading': 'Match History',
		'history.loading': 'Loading match history...',
		'history.table.opponent': 'Opponent',
		'history.table.score': 'Score',
		'history.table.type': 'Type',
		'history.table.date': 'Date',
		'history.table.blockchain': 'Blockchain',
		'history.table.empty': 'No matches found',
		'history.opponent.cpu': 'CPU',
		'history.opponent.avatar.alt': 'Opponent avatar',
		'history.loadError': 'Failed to load match history',
		'history.stats.total': 'Total Matches',
		'history.stats.wins': 'Wins',
		'history.stats.losses': 'Losses',
		'history.stats.winRate': 'Win Rate',

		// Game
		'game.heading': 'Play Pong',
		'game.quickPlay': 'Quick Play',
		'game.tournament': 'Tournament',
		'game.friend.heading': 'Play with Friend',
		'game.friend.desc': 'Challenge your friend on the same device',
		'game.ai.heading': 'Play with AI',
		'game.ai.desc': 'Challenge AI on the same device',

		// Game Messages
		'game.left': 'Left',
		'game.right': 'Right',
		'game.role.left': 'Role: Left player',
		'game.role.right': 'Role: Right player',
		'game.role.spectator': 'Role: Spectator',
		'game.role.disconnected': 'Role: disconnected',
		'game.connected': "Connected to server! Press 'R' to play.",
		'game.ready': "Game ready. Press 'R' to start.",
		'game.disconnected': 'Disconnected from server!',
		'game.isOn': 'Game is on!',
		'game.waitingPlayer': 'Waiting for a second player to join.',
		'game.waitingReady': 'Waiting for players to confirm they are ready.',
		'game.waitingReadyWithAction': "Waiting for players to confirm they are ready. Press 'R' if you are ready.",
		'game.waitingSecondPlayer': 'Waiting for the second player to be ready.',
		'game.leftPlayerReady': "Left player is ready. Press 'R' if you are ready.",
		'game.rightPlayerReady': "Right player is ready. Press 'R' if you are ready.",
		'game.prepareCountdown': 'Prepare yourself! Game starts in {count}',
		'game.rematchProposed': "Rematch proposed! Press 'R' if you are ready.",
		'game.rematchProposedSpectator': 'Rematch proposed! Waiting for players to confirm.',
		'game.winnerLeft': 'Left player won!',
		'game.winnerRight': 'Right player won!',
		'game.leftWinner': 'LEFT WINNER',
		'game.rightWinner': 'RIGHT WINNER',
		'game.errorReload': 'Error occured. Please reload game.',
		'game.reset': 'Reseting the game... The oponent left the game.',

		// Tournament
		'tournament.heading': 'Tournament',
		'tournament.new': 'New Tournament',
		'tournament.refresh': 'Refresh',
		'tournament.th.creator': 'Creator',
		'tournament.th.players': 'Players',
		'tournament.th.join': 'Join',
		'tournament.noTournamentsFound': 'No tournaments found',

		// Profile
		'profile.heading': 'Profile',
		'profile.friendProfile': 'Friend Profile',
		'profile.gameHistory': 'Game History',
		'profile.settings': 'Settings',
		'profile.noEmail': 'No email',
		'profile.failedToLoadHistory': 'Failed to load game history',
		'profile.table.opponent': 'Opponent',
		'profile.table.score': 'Score',
		'profile.table.type': 'Type',
		'profile.table.date': 'Date',
		'profile.table.blockchain': 'Blockchain',
	},
	pl: {
		// Header
		'header.language': 'Język',
		'header.profile': 'Profil',
		'header.logout': 'Wyloguj',
		'languages.en': 'English',
		'languages.pl': 'Polski',
		'languages.es': 'Español',

		// Auth
		'auth.authenticate': 'Uwierzytelnij się',
		'auth.google': 'Zaloguj przez Google',
		'auth.tabs.login': 'Logowanie',
		'auth.tabs.register': 'Rejestracja',
		'login.heading': 'Witaj ponownie!',
		'login.username.label': 'Nazwa użytkownika:',
		'login.username.placeholder': 'nazwa użytkownika',
		'login.password.label': 'Hasło:',
		'login.password.placeholder': '********',
		'login.totp.label': 'Kod 2FA:',
		'login.totp.placeholder': '123456',
		'login.submit': 'Zaloguj się',
		'login.2fa.prompt': 'Wprowadź kod 2FA',
		'login.success': 'Logowanie zakończone sukcesem!',
		'login.unknownError': 'Wystąpił nieznany błąd. Spróbuj ponownie.',

		'register.heading': 'Utwórz konto!',
		'register.email.label': 'Adres e-mail:',
		'register.email.placeholder': 'przyklad@email.com',
		'register.username.label': 'Nazwa użytkownika:',
		'register.username.placeholder': 'nazwa użytkownika',
		'register.password.label': 'Hasło:',
		'register.password.placeholder': '********',
		'register.confirmPassword.label': 'Potwierdź hasło:',
		'register.confirmPassword.placeholder': '********',
		'register.success':
			'Rejestracja zakończona sukcesem! Zeskanuj kod QR w aplikacji uwierzytelniającej.',
		'register.qr.alt': 'Kod QR 2FA',
		'register.submit': 'Zarejestruj się',

		// Home/Friends
		'home.friends.heading': 'Znajomi',
		'friends.noRequests': 'Brak zaproszeń do znajomych',
		'friends.search.placeholder': 'Szukaj znajomych...',
		'friends.add': 'Dodaj',
		'friends.addByUsernamePlaceholder': 'Dodaj znajomego po nazwie użytkownika...',
		'friends.allFriends': 'Wszyscy znajomi',
		'friends.requests': 'Zaproszenia',
		'friends.blocked': 'Zablokowani',
		'friends.noBlockedUsers': 'Brak zablokowanych użytkowników',

		// Messages
		'messages.noMessages': 'Brak wiadomości. Rozpocznij rozmowę!',
		'messages.input.placeholder': 'Napisz wiadomość...',
		'messages.send': 'Wyślij',

		// History
		'history.heading': 'Historia meczów',
		'history.loading': 'Wczytywanie historii meczów...',
		'history.table.opponent': 'Przeciwnik',
		'history.table.score': 'Wynik',
		'history.table.type': 'Typ',
		'history.table.date': 'Data',
		'history.table.blockchain': 'Blockchain',
		'history.table.empty': 'Brak meczów',
		'history.opponent.cpu': 'CPU',
		'history.opponent.avatar.alt': 'Awatar przeciwnika',
		'history.loadError': 'Nie udało się wczytać historii meczów',
		'history.stats.total': 'Łącznie meczów',
		'history.stats.wins': 'Wygrane',
		'history.stats.losses': 'Przegrane',
		'history.stats.winRate': 'Współczynnik wygranych',

		// Game
		'game.heading': 'Zagraj w Pong',
		'game.quickPlay': 'Szybka gra',
		'game.tournament': 'Turniej',
		'game.friend.heading': 'Zagraj ze znajomym',
		'game.friend.desc': 'Rzuć wyzwanie znajomemu na tym samym urządzeniu',
		'game.ai.heading': 'Zagraj z SI',
		'game.ai.desc': 'Rzuć wyzwanie SI na tym samym urządzeniu',

		// Game Messages
		'game.left': 'Lewy',
		'game.right': 'Prawy',
		'game.role.left': 'Rola: Lewy gracz',
		'game.role.right': 'Rola: Prawy gracz',
		'game.role.spectator': 'Rola: Obserwator',
		'game.role.disconnected': 'Rola: rozłączony',
		'game.connected': "Połączono z serwerem! Naciśnij 'R' aby zagrać.",
		'game.ready': "Gra gotowa. Naciśnij 'R' aby rozpocząć.",
		'game.disconnected': 'Rozłączono z serwerem!',
		'game.isOn': 'Gra trwa!',
		'game.waitingPlayer': 'Oczekiwanie na drugiego gracza.',
		'game.waitingReady': 'Oczekiwanie na potwierdzenie gotowości graczy.',
		'game.waitingReadyWithAction': "Oczekiwanie na potwierdzenie gotowości graczy. Naciśnij 'R' jeśli jesteś gotowy.",
		'game.waitingSecondPlayer': 'Oczekiwanie na gotowość drugiego gracza.',
		'game.leftPlayerReady': "Lewy gracz jest gotowy. Naciśnij 'R' jeśli jesteś gotowy.",
		'game.rightPlayerReady': "Prawy gracz jest gotowy. Naciśnij 'R' jeśli jesteś gotowy.",
		'game.prepareCountdown': 'Przygotuj się! Gra rozpocznie się za {count}',
		'game.rematchProposed': "Zaproponowano rewanż! Naciśnij 'R' jeśli jesteś gotowy.",
		'game.rematchProposedSpectator': 'Zaproponowano rewanż! Oczekiwanie na potwierdzenie graczy.',
		'game.winnerLeft': 'Lewy gracz wygrał!',
		'game.winnerRight': 'Prawy gracz wygrał!',
		'game.leftWinner': 'LEWY ZWYCIĘZCA',
		'game.rightWinner': 'PRAWY ZWYCIĘZCA',
		'game.errorReload': 'Wystąpił błąd. Proszę przeładować grę.',
		'game.reset': 'Resetowanie gry... Przeciwnik opuścił grę.',

		// Tournament
		'tournament.heading': 'Turniej',
		'tournament.new': 'Nowy turniej',
		'tournament.refresh': 'Odśwież',
		'tournament.th.creator': 'Twórca',
		'tournament.th.players': 'Gracze',
		'tournament.th.join': 'Dołącz',
		'tournament.noTournamentsFound': 'Nie znaleziono turniejów',

		// Profile
		'profile.heading': 'Profil',
		'profile.friendProfile': 'Profil znajomego',
		'profile.gameHistory': 'Historia gier',
		'profile.settings': 'Ustawienia',
		'profile.noEmail': 'Brak emaila',
		'profile.failedToLoadHistory': 'Nie udało się wczytać historii gier',
		'profile.table.opponent': 'Przeciwnik',
		'profile.table.score': 'Wynik',
		'profile.table.type': 'Typ',
		'profile.table.date': 'Data',
		'profile.table.blockchain': 'Blockchain',
	},
	es: {
		// Header
		'header.language': 'Idioma',
		'header.profile': 'Perfil',
		'header.logout': 'Cerrar sesión',
		'languages.en': 'English',
		'languages.pl': 'Polski',
		'languages.es': 'Español',

		// Auth
		'auth.authenticate': 'Autenticar',
		'auth.google': 'Autentícate con Google',
		'auth.tabs.login': 'Iniciar sesión',
		'auth.tabs.register': 'Registrarse',
		'login.heading': '¡Bienvenido de nuevo!',
		'login.username.label': 'Usuario:',
		'login.username.placeholder': 'tu usuario',
		'login.password.label': 'Contraseña:',
		'login.password.placeholder': '********',
		'login.totp.label': 'Código 2FA:',
		'login.totp.placeholder': '123456',
		'login.submit': 'Entrar',
		'login.2fa.prompt': 'Por favor introduce tu código 2FA',
		'login.success': '¡Inicio de sesión exitoso!',
		'login.unknownError': 'Ocurrió un error desconocido. Inténtalo de nuevo.',

		'register.heading': '¡Crea tu cuenta!',
		'register.email.label': 'Correo electrónico:',
		'register.email.placeholder': 'ejemplo@correo.com',
		'register.username.label': 'Usuario:',
		'register.username.placeholder': 'tu usuario',
		'register.password.label': 'Contraseña:',
		'register.password.placeholder': '********',
		'register.confirmPassword.label': 'Confirmar contraseña:',
		'register.confirmPassword.placeholder': '********',
		'register.success':
			'¡Registro exitoso! Escanea el código QR con tu aplicación de autenticación.',
		'register.qr.alt': 'Código QR 2FA',
		'register.submit': 'Registrarse',

		// Home/Friends
		'home.friends.heading': 'Amigos',
		'friends.noRequests': 'No hay solicitudes de amistad',
		'friends.search.placeholder': 'Buscar amigos...',
		'friends.add': 'Añadir',
		'friends.addByUsernamePlaceholder': 'Añadir amigo por nombre de usuario...',
		'friends.allFriends': 'Todos los amigos',
		'friends.requests': 'Solicitudes',
		'friends.blocked': 'Bloqueados',
		'friends.noBlockedUsers': 'No hay usuarios bloqueados',

		// Messages
		'messages.noMessages': 'Aún no hay mensajes. ¡Inicia la conversación!',
		'messages.input.placeholder': 'Escribe un mensaje...',
		'messages.send': 'Enviar',

		// History
		'history.heading': 'Historial de partidas',
		'history.loading': 'Cargando historial de partidas...',
		'history.table.opponent': 'Oponente',
		'history.table.score': 'Marcador',
		'history.table.type': 'Tipo',
		'history.table.date': 'Fecha',
		'history.table.blockchain': 'Blockchain',
		'history.table.empty': 'No se encontraron partidas',
		'history.opponent.cpu': 'CPU',
		'history.opponent.avatar.alt': 'Avatar del oponente',
		'history.loadError': 'Error al cargar el historial de partidas',
		'history.stats.total': 'Partidas totales',
		'history.stats.wins': 'Victorias',
		'history.stats.losses': 'Derrotas',
		'history.stats.winRate': 'Porcentaje de victorias',

		// Game
		'game.heading': 'Jugar Pong',
		'game.quickPlay': 'Juego rápido',
		'game.tournament': 'Torneo',
		'game.friend.heading': 'Jugar con amigo',
		'game.friend.desc': 'Desafía a tu amigo en el mismo dispositivo',
		'game.ai.heading': 'Jugar contra IA',
		'game.ai.desc': 'Desafía a la IA en el mismo dispositivo',

		// Game Messages
		'game.left': 'Izquierdo',
		'game.right': 'Derecho',
		'game.role.left': 'Rol: Jugador izquierdo',
		'game.role.right': 'Rol: Jugador derecho',
		'game.role.spectator': 'Rol: Espectador',
		'game.role.disconnected': 'Rol: desconectado',
		'game.connected': "¡Conectado al servidor! Presiona 'R' para jugar.",
		'game.ready': "Juego listo. Presiona 'R' para empezar.",
		'game.disconnected': '¡Desconectado del servidor!',
		'game.isOn': '¡El juego está en curso!',
		'game.waitingPlayer': 'Esperando a que se una un segundo jugador.',
		'game.waitingReady': 'Esperando confirmación de que los jugadores están listos.',
		'game.waitingReadyWithAction': "Esperando confirmación de que los jugadores están listos. Presiona 'R' si estás listo.",
		'game.waitingSecondPlayer': 'Esperando a que el segundo jugador esté listo.',
		'game.leftPlayerReady': "El jugador izquierdo está listo. Presiona 'R' si estás listo.",
		'game.rightPlayerReady': "El jugador derecho está listo. Presiona 'R' si estás listo.",
		'game.prepareCountdown': '¡Prepárate! El juego comienza en {count}',
		'game.rematchProposed': "¡Revancha propuesta! Presiona 'R' si estás listo.",
		'game.rematchProposedSpectator': '¡Revancha propuesta! Esperando confirmación de los jugadores.',
		'game.winnerLeft': '¡El jugador izquierdo ganó!',
		'game.winnerRight': '¡El jugador derecho ganó!',
		'game.leftWinner': 'GANADOR IZQUIERDO',
		'game.rightWinner': 'GANADOR DERECHO',
		'game.errorReload': 'Ocurrió un error. Por favor recarga el juego.',
		'game.reset': 'Reiniciando el juego... El oponente abandonó la partida.',

		// Tournament
		'tournament.heading': 'Torneo',
		'tournament.new': 'Nuevo torneo',
		'tournament.refresh': 'Actualizar',
		'tournament.th.creator': 'Creador',
		'tournament.th.players': 'Jugadores',
		'tournament.th.join': 'Unirse',
		'tournament.noTournamentsFound': 'No se encontraron torneos',

		// Profile
		'profile.heading': 'Perfil',
		'profile.friendProfile': 'Perfil del amigo',
		'profile.gameHistory': 'Historial de juegos',
		'profile.settings': 'Configuración',
		'profile.noEmail': 'Sin email',
		'profile.failedToLoadHistory': 'Error al cargar el historial de juegos',
		'profile.table.opponent': 'Oponente',
		'profile.table.score': 'Marcador',
		'profile.table.type': 'Tipo',
		'profile.table.date': 'Fecha',
		'profile.table.blockchain': 'Blockchain',
	},
};

export function registerTranslations(lang: string, dict: Dict) {
	translations[lang] = { ...(translations[lang] || {}), ...dict };
}

export function t(key: string): string {
	const lang = getCurrentLang();
	return translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
}

function translateElement(el: Element) {
	const key = el.getAttribute('data-i18n');
	if (key) {
		const translated = t(key);
		// Prefer a dedicated child if present
		const slot = (el as HTMLElement).querySelector('[data-i18n-text]');
		if (slot) {
			(slot as HTMLElement).textContent = translated;
		} else {
			// Try to update the first text node among children to preserve icons/elements
			let updated = false;
			for (const node of Array.from(el.childNodes)) {
				if (node.nodeType === Node.TEXT_NODE) {
					node.nodeValue = translated;
					updated = true;
					break;
				}
			}
			// If no text node exists, append a span for text translation
			if (!updated) {
				const span = document.createElement('span');
				span.setAttribute('data-i18n-text', '');
				span.textContent = translated;
				el.appendChild(span);
			}
		}
	}
	const attrMap: Record<string, string> = {
		'data-i18n-title': 'title',
		'data-i18n-placeholder': 'placeholder',
		'data-i18n-aria-label': 'aria-label',
		'data-i18n-alt': 'alt',
	};
	for (const dataAttr in attrMap) {
		const attrKey = el.getAttribute(dataAttr);
		if (attrKey) {
			el.setAttribute(attrMap[dataAttr], t(attrKey));
		}
	}
}

export function applyTranslations(root: ParentNode = document) {
	const elements = (root as Document | Element).querySelectorAll?.(
		'[data-i18n], [data-i18n-title], [data-i18n-placeholder], [data-i18n-aria-label]'
	);
	elements?.forEach((el) => translateElement(el));
}

let observerStarted = false;
function startObserver() {
	if (observerStarted || !('MutationObserver' in window)) return;
	const observer = new MutationObserver((mutations) => {
		for (const m of mutations) {
			m.addedNodes.forEach((node) => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const el = node as Element;
					translateElement(el);
					el.querySelectorAll(
						'[data-i18n], [data-i18n-title], [data-i18n-placeholder], [data-i18n-aria-label]'
					).forEach((child) => translateElement(child));
				}
			});
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });
	observerStarted = true;
}

export function initI18n() {
	// Initial application
	applyTranslations(document);
	// Auto-apply on language changes
	onLanguageChange(() => applyTranslations(document));
	// Observe dynamically added nodes
	startObserver();
}
