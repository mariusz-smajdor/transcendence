import { Container } from '../components/container.js';
import { Title } from '../components/title.js';
import { Wrapper } from '../components/wrapper.js';
import { type IconProps, Icon } from '../components/icon.js';
import { type LinkProps, Link } from '../components/link.js';
import { createElement, ArrowRight } from 'lucide';

function DropdownItem({ link, icon }: { link: LinkProps; icon?: IconProps }) {
	const dropdownItem = Wrapper([
		'flex',
		'w-full',
		'cursor-pointer',
		'items-center',
		'justify-between',
		'gap-2',
		'rounded',
		'py-[4px]',
		'px-[6px]',
		'hover:bg-muted',
	]);
	dropdownItem.appendChild(Link(link));
	if (icon) {
		dropdownItem.appendChild(Icon(icon));
	}

	return dropdownItem;
}

function DropdownMenu(classes: string[] = []) {
	const dropdownMenu = Wrapper([
		'min-w-38',
		'gap-1',
		'flex',
		'flex-col',
		'rounded',
		'border',
		'border-border',
		'bg-background',
		'p-1',
		'text-sm',
		'shadow-sm',
		'hidden',
		'md:flex-row',
		'md:gap-4',
		'md:rounded-none',
		'md:border-0',
		'md:bg-transparent',
		'md:p-0',
		'md:shadow-none',
		...classes,
	]);
	return dropdownMenu;
}

function Menu() {
	const menu = Wrapper(['relative', 'flex', 'gap-4', 'items-center']);
	menu.appendChild(
		Icon({
			name: ['fa-solid', 'fa-language'],
			classes: ['cursor-pointer', 'text-xl'],
		})
	);
	const hamburgerMenu = Icon({
		name: ['fa-solid', 'fa-bars'],
		classes: ['cursor-pointer', 'text-xl', 'md:before:hidden'],
	});
	menu.appendChild(hamburgerMenu);

	const dropdownMenu = DropdownMenu([
		'absolute',
		'right-0',
		'top-8',
		'md:relative',
		'md:top-0',
		'md:right-0',
	]);
	dropdownMenu.appendChild(
		DropdownItem({
			link: { content: 'Sign in', href: '/login', classes: ['text-nowrap'] },
			icon: { name: ['fa-solid', 'fa-user-check'] },
		})
	);
	dropdownMenu.appendChild(
		DropdownItem({
			link: { content: 'Sign up', href: '/signup', classes: ['text-nowrap'] },
			icon: { name: ['fa-solid', 'fa-user-plus'] },
		})
	);
	hamburgerMenu.addEventListener('click', () => {
		dropdownMenu.classList.toggle('hidden');
	});
	menu.appendChild(dropdownMenu);
	return menu;
}

function Logo() {
	const logo = Wrapper(['cursor-pointer', 'flex', 'items-center', 'gap-2']);
	logo.appendChild(
		Icon({
			name: ['fa-solid', 'fa-table-tennis-paddle-ball'],
			classes: ['text-xl'],
		})
	);
	logo.appendChild(
		Title({
			level: 2,
			content: 'Super Pong',
			classes: ['text-nowrap'],
		})
	);
	logo.addEventListener('click', () => {
		window.location.href = '/';
	});

	return logo;
}

export default function Header() {
	const header = document.createElement('header');
	header.classList.add('flex', 'h-14', 'w-full', 'items-center', 'shadow-sm');

	const container = Container(['flex', 'items-center', 'justify-between']);
	const logo = Logo();
	const menu = Menu();

	const lucideIcon = createElement(ArrowRight);

	container.appendChild(logo);
	container.appendChild(menu);
	container.appendChild(lucideIcon);

	header.appendChild(container);
	return header;
}
