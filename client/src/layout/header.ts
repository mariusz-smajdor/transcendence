import { CircleMinus, Menu as Bars, LogIn, ClipboardPen } from 'lucide';
import { Container } from '../components/container';
import { Wrapper } from '../components/wrapper';
import { Icon } from '../components/icon';
import { Title } from '../components/title';
import { Button } from '../components/button';
import { Link } from '../components/link';
import {
	DropdownMenu,
	DropdownTitle,
	DropdownItem,
	DropdownSeparator,
} from '../components/dropdown-menu';

function DesktopMenu() {
	const wrapper = Wrapper({
		classes: ['hidden', 'gap-2', 'text-sm', 'md:flex'],
	});

	const signInLink = Link({
		content: 'Sign in',
		href: 'login',
		classes: [
			'flex',
			'items-center',
			'gap-1',
			'rounded',
			'px-3',
			'py-1',
			'hover:bg-accent',
		],
	});
	signInLink.appendChild(Icon({ icon: LogIn, size: 'sm' }));

	const signUpLink = Button({
		asLink: true,
		size: 'sm',
		href: 'register',
		content: 'Sign up',
	});

	wrapper.appendChild(signInLink);
	wrapper.appendChild(signUpLink);

	return wrapper;
}

function MobileMenu() {
	const wrapper = Wrapper({
		classes: ['relative', 'md:hidden'],
	});

	const toggleButton = Button({
		size: 'icon',
		variant: 'ghost',
	});
	toggleButton.appendChild(Icon({ icon: Bars }));

	const dropdownMenu = DropdownMenu({
		dropdownTrigger: toggleButton,
		classes: ['absolute', 'right-0', 'top-12'],
	});

	const signInItem = DropdownItem({});
	const signInLink = Link({
		content: 'Sign in',
		href: 'login',
		classes: ['flex', 'w-full', 'items-center', 'justify-between', 'gap-2'],
	});
	signInLink.appendChild(Icon({ icon: LogIn, size: 'sm' }));
	signInItem.appendChild(signInLink);

	const signUpItem = DropdownItem({});
	const signUpLink = Link({
		content: 'Sign up',
		href: 'register',
		classes: ['flex', 'w-full', 'items-center', 'justify-between', 'gap-2'],
	});
	signUpLink.appendChild(Icon({ icon: ClipboardPen, size: 'sm' }));
	signUpItem.appendChild(signUpLink);

	dropdownMenu.appendChild(DropdownTitle({ content: 'Account' }));
	dropdownMenu.appendChild(DropdownSeparator());
	dropdownMenu.appendChild(signInItem);
	dropdownMenu.appendChild(signUpItem);

	wrapper.appendChild(dropdownMenu);
	wrapper.appendChild(toggleButton);

	const menu = Wrapper({ classes: ['hidden', 'md:flex'] });
	wrapper.appendChild(menu);

	return wrapper;
}

function Menu() {
	const wrapper = Wrapper({});
	wrapper.appendChild(DesktopMenu());
	wrapper.appendChild(MobileMenu());
	return wrapper;
}

function Logo() {
	const wrapper = Wrapper({
		classes: ['flex', 'cursor-pointer', 'items-center', 'gap-2', 'select-none'],
	});
	wrapper.addEventListener('click', () => {
		window.location.href = '/';
	});
	wrapper.appendChild(Icon({ icon: CircleMinus, size: 'lg' }));
	wrapper.appendChild(
		Title({
			level: 2,
			content: 'Super Pong',
			classes: ['text-nowrap'],
		})
	);
	return wrapper;
}

export default function Header() {
	const header = document.createElement('header');
	header.classList.add(
		'flex',
		'h-14',
		'w-full',
		'items-center',
		'border-b',
		'border-accent'
	);

	const container = Container({
		classes: ['flex', 'items-center', 'justify-between'],
	});

	container.appendChild(Logo());
	container.appendChild(Menu());
	header.appendChild(container);

	return header;
}
