import { Languages, LogOut, User } from 'lucide';
import { Wrapper } from '../components/wrapper';
import { Container } from '../components/container';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Text } from '../components/text';
import { Img } from '../components/img';
import {
	DropdownItem,
	DropdownMenu,
	DropdownSeparator,
	DropdownTitle,
} from '../components/dropdown-menu';
import { store } from '../store';
import Profile from '../views/profile';

function Menu() {
	const user = store.getState().user;

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

	if (user) {
		const avatar = Img({
			src: user.avatar || 'https://i.pravatar.cc/300',
			alt: 'User Avatar',
			loading: 'lazy',
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
			classes: ['top-16', 'right-12'],
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
				const res = await fetch('http://localhost:3000/logout', {
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
		menu.appendChild(avatar);
		menu.appendChild(dropdownMenu);
	}

	return menu;
}

function Logo() {
	const logo = Heading({
		level: 1,
		classes: ['cursor-pointer', 'select-none', 'text-xl'],
	});
	const logoContent1 = Text({
		content: 'Super',
		classes: ['text-primary', 'glow-primary-animate'],
	});
	const logoContent2 = Text({
		content: 'Pong',
		classes: ['text-secondary', 'glow-secondary-animate'],
	});

	logo.addEventListener('click', () => {
		window.location.href = '/';
	});

	logo.appendChild(logoContent1);
	logo.appendChild(logoContent2);

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
