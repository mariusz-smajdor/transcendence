import { ClipboardPen, LogIn, Menu as Bars } from 'lucide';
import {
	DropdownItem,
	DropdownMenu,
	DropdownSeparator,
	DropdownTitle,
} from '../../components/dropdown-menu';
import { Icon } from '../../components/icon';
import { Wrapper } from '../../components/wrapper';
import { store } from '../../state/store';
import { Link } from '../../components/link';
import { Button } from '../../components/button';

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
		classes: ['flex', 'items-center', 'gap-1'],
	});
	signUpLink.appendChild(Icon({ icon: ClipboardPen, size: 'sm' }));

	const signOutLink = Button({
		variant: 'ghost',
		size: 'sm',
		content: 'Sign out',
		classes: ['flex', 'items-center', 'gap-1'],
	});
	signOutLink.appendChild(Icon({ icon: LogIn, size: 'sm' }));

	signOutLink.addEventListener('click', async () => {
		await fetch('http://localhost:3000/logout', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${store.getState().accessToken}`,
			},
			credentials: 'include',
		});
		store.setState({ accessToken: null, user: null });
		window.location.href = '/';
	});

	function update(wrapper: HTMLElement) {
		wrapper.innerHTML = '';
		const state = store.getState();
		if (state.accessToken) {
			wrapper.appendChild(signOutLink);
		} else {
			wrapper.appendChild(signInLink);
			wrapper.appendChild(signUpLink);
		}
	}

	update(wrapper);
	store.subscribe(() => update(wrapper));

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

	const dropdownTitle = DropdownTitle({
		content: store.getState().user ? 'Account' : 'Join Super Pong!',
	});
	dropdownMenu.appendChild(dropdownTitle);
	dropdownMenu.appendChild(DropdownSeparator());

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

	const signOutItem = DropdownItem({});
	const signOutLink = Link({
		content: 'Sign out',
		href: '/',
		classes: ['flex', 'w-full', 'items-center', 'justify-between', 'gap-2'],
	});
	signOutLink.appendChild(Icon({ icon: LogIn, size: 'sm' }));
	signOutLink.addEventListener('click', async (e) => {
		e.preventDefault();

		try {
			const res = await fetch('http://localhost:3000/logout', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${store.getState().accessToken}`,
				},
				credentials: 'include',
			});

			if (res.ok) {
				store.setState({ accessToken: null, user: null });
				window.location.href = '/';
			} else {
				console.error('Logout failed');
			}
		} catch (error) {
			console.error('Error during logout:', error);
		}
	});
	signOutItem.appendChild(signOutLink);

	function update() {
		dropdownMenu.replaceChildren(dropdownTitle, DropdownSeparator());

		const state = store.getState();
		dropdownTitle.textContent = state.user ? 'Account' : 'Join Super Pong!';

		if (state.accessToken) {
			dropdownMenu.appendChild(signOutItem);
		} else {
			dropdownMenu.appendChild(signInItem);
			dropdownMenu.appendChild(signUpItem);
		}
	}

	update();
	store.subscribe(() => update());

	wrapper.appendChild(dropdownMenu);
	wrapper.appendChild(toggleButton);

	const menu = Wrapper({ classes: ['hidden', 'md:flex'] });
	wrapper.appendChild(menu);

	return wrapper;
}

export default function Menu() {
	const wrapper = Wrapper({});
	wrapper.appendChild(DesktopMenu());
	wrapper.appendChild(MobileMenu());

	return wrapper;
}
