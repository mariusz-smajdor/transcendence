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

		// Tournament
		'tournament.heading': 'Tournament',
		'tournament.new': 'New Tournament',
		'tournament.refresh': 'Refresh',
		'tournament.th.creator': 'Creator',
		'tournament.th.players': 'Players',
		'tournament.th.join': 'Join',
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

		// Tournament
		'tournament.heading': 'Turniej',
		'tournament.new': 'Nowy turniej',
		'tournament.refresh': 'Odśwież',
		'tournament.th.creator': 'Twórca',
		'tournament.th.players': 'Gracze',
		'tournament.th.join': 'Dołącz',
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

		// Tournament
		'tournament.heading': 'Torneo',
		'tournament.new': 'Nuevo torneo',
		'tournament.refresh': 'Actualizar',
		'tournament.th.creator': 'Creador',
		'tournament.th.players': 'Jugadores',
		'tournament.th.join': 'Unirse',
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
