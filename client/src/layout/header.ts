import { Languages, LogOut, User } from 'lucide';
import { Wrapper } from '../components/wrapper';
import { Container } from '../components/container';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Img } from '../components/img';
import {
	DropdownItem,
	DropdownMenu,
	DropdownSeparator,
	DropdownTitle,
} from '../components/dropdown-menu';
import { store } from '../store';
import { getAvatarUrl } from '../utils/avatarUtils';
import { deleteCookie } from '../views/game/game-cookies';
import { t } from '../services/i18n';
import { initLanguage, setCurrentLang } from '../services/languageService';

function Menu() {
	const menu = Wrapper({
		classes: ['flex', 'gap-4', 'lg:gap-6', 'items-center'],
	});

	// Initialize language via service (from localStorage)
	initLanguage();

	const languagesIcon = Icon({
		icon: Languages,
		classes: [
			'cursor-pointer',
			'transition-colors',
			'duration-300',
			'hover:text-secondary',
		],
	});

	// Languages dropdown
	const languagesContainer = Wrapper({ classes: ['relative'] });
	const languagesDropdown = DropdownMenu({
		dropdownTrigger: languagesIcon,
		classes: ['top-12', 'right-0'],
		// Do not sync with URL for language picker
		syncWithUrl: false,
	});

	const languagesTitle = DropdownTitle({ content: t('header.language') });
	const langEn = DropdownItem({ content: t('languages.en') });
	const langPl = DropdownItem({ content: t('languages.pl') });
	const langEs = DropdownItem({ content: t('languages.es') });

	// Mark elements for live translation updates
	languagesTitle.setAttribute('data-i18n', 'header.language');
	langEn.setAttribute('data-i18n', 'languages.en');
	langPl.setAttribute('data-i18n', 'languages.pl');
	langEs.setAttribute('data-i18n', 'languages.es');

	function applyLanguage(langCode: string) {
		setCurrentLang(langCode);
		// Close without touching URL history
		(languagesDropdown as any)?.closeMenu?.(false);
	}

	langEn.addEventListener('click', () => applyLanguage('en'));
	langPl.addEventListener('click', () => applyLanguage('pl'));
	langEs.addEventListener('click', () => applyLanguage('es'));

	languagesDropdown.appendChild(languagesTitle);
	languagesDropdown.appendChild(DropdownSeparator());
	languagesDropdown.appendChild(langEn);
	languagesDropdown.appendChild(langPl);
	languagesDropdown.appendChild(langEs);

	languagesContainer.appendChild(languagesIcon);
	languagesContainer.appendChild(languagesDropdown);
	menu.appendChild(languagesContainer);

	function renderUserMenu() {
		// Remove existing user menu if it exists
		const existingUserMenu = menu.querySelector('.user-menu');
		if (existingUserMenu) {
			existingUserMenu.remove();
		}

		const user = store.getState().user;
		if (!user) return;

		const userMenu = Wrapper({
			classes: ['user-menu', 'relative'],
		});

		const avatarContainer = Wrapper({
			classes: ['relative'],
		});
		const avatar = Img({
			src: getAvatarUrl(user.avatar, user?.username),
			alt: 'User Avatar',
			classes: [
				'w-10',
				'h-10',
				'rounded-full',
				'border-2',
				'border-primary',
				'transition-colors',
				'duration-300',
				'cursor-pointer',
				'hover:border-secondary',
			],
		});
		const dropdownMenu = DropdownMenu({
			dropdownTrigger: avatar,
			classes: ['top-12', 'right-0'],
			// Disable URL sync - popups shouldn't create history entries
			syncWithUrl: false,
		});
		const dropdownTitle = DropdownTitle({
			content: user.username,
			classes: ['glow-primary-animate'],
		});
		const profileIcon = Icon({
			icon: User,
			size: 'sm',
		});
		const dropdownProfile = DropdownItem({ content: t('header.profile') });
		dropdownProfile.setAttribute('data-i18n', 'header.profile');
		dropdownProfile.setAttribute('data-link', '/profile');
		const logoutIcon = Icon({
			icon: LogOut,
			size: 'sm',
		});
		const dropdownLogout = DropdownItem({ content: t('header.logout') });
		dropdownLogout.setAttribute('data-i18n', 'header.logout');

		dropdownLogout.addEventListener('click', async (e) => {
			e.preventDefault();

			try {
				const res = await fetch('/api/logout', {
					method: 'POST',
					credentials: 'include',
				});

				if (res.ok) {
					// Clear access token cookie
					deleteCookie('access_token');
					store.setState({ user: null });
					window.location.href = '/';
				} else {
					console.error('Logout failed:', await res.text());
				}
			} catch (error) {
				console.error('Error during logout:', error);
			}
		});

		dropdownProfile.addEventListener('click', () => {
			// Close dropdown and open profile modal
			(dropdownMenu as any)?.closeMenu?.(false);
			// Import and show the modal profile
			import('../views/profile/index.js').then((module) => {
				const ProfileModal = module.default;
				const profileModal = ProfileModal();
				document.body.appendChild(profileModal);
			});
		});

		dropdownProfile.appendChild(profileIcon);
		dropdownLogout.appendChild(logoutIcon);
		dropdownMenu.appendChild(dropdownTitle);
		dropdownMenu.appendChild(DropdownSeparator());
		dropdownMenu.appendChild(dropdownProfile);
		dropdownMenu.appendChild(dropdownLogout);
		avatarContainer.appendChild(avatar);
		avatarContainer.appendChild(dropdownMenu);
		userMenu.appendChild(avatarContainer);
		menu.appendChild(userMenu);
	}

	// Initial render
	renderUserMenu();

	// No navigation: do not handle modal state

	// Listen for user updates
	store.on('userUpdated', renderUserMenu);

	return menu;
}

function Logo() {
	const logo = Heading({
		level: 1,
		classes: ['cursor-pointer', 'select-none', 'text-xl'],
	});
	const logoIcon = Img({
		src: '/favicon.png',
		alt: 'Logo',
		width: 32,
		height: 32,
	});

	logo.addEventListener('click', () => {
		window.location.href = '/';
	});

	logo.appendChild(logoIcon);

	return logo;
}

export default function Header() {
	const header = Wrapper({
		element: 'header',
		classes: [
			'h-14',
			'bg-foreground',
			'bg-foreground',
			'border-b',
			'border-accent',
		],
	});
	const container = Container({
		classes: ['flex', 'justify-between', 'items-center', 'h-full'],
	});

	container.appendChild(Logo());
	container.appendChild(Menu());
	header.appendChild(container);

	return header;
}
