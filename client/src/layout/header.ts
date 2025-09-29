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
import Profile from '../views/profile';
import { getAvatarUrl } from '../utils/avatarUtils';

function Menu() {
	const menu = Wrapper({
		classes: ['flex', 'gap-4', 'lg:gap-6', 'items-center'],
	});
	const languagesIcon = Icon({
		icon: Languages,
		classes: [
			'cursor-pointer',
			'transition-colors',
			'duration-300',
			'hover:text-secondary',
		],
	});
	menu.appendChild(languagesIcon);

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
		});
		const dropdownTitle = DropdownTitle({
			content: user.username,
			classes: ['glow-primary-animate'],
		});
		const profileIcon = Icon({
			icon: User,
			size: 'sm',
		});
		const dropdownProfile = DropdownItem({
			content: 'Profile',
		});
		const logoutIcon = Icon({
			icon: LogOut,
			size: 'sm',
		});
		const dropdownLogout = DropdownItem({
			content: 'Logout',
		});

		dropdownLogout.addEventListener('click', async (e) => {
			e.preventDefault();

			try {
				const res = await fetch('/api/logout', {
					method: 'POST',
					credentials: 'include',
				});

				if (res.ok) {
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
			document.body.appendChild(Profile());
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
