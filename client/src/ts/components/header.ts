function NavLink(text: string, href: string): HTMLAnchorElement {
	const link = document.createElement('a');

	link.href = href;
	link.textContent = text;
	link.classList.add('text-gray-900', 'hover:underline');
	return link;
}

export default function Header(): HTMLElement {
	const header = document.createElement('header');
	header.classList.add(
		'flex',
		'items-center',
		'justify-between',
		'w-full',
		'h-14',
		'px-6',
		'shadow-sm'
	);

	const buttons = document.createElement('div');
	buttons.classList.add('flex', 'gap-4');

	const loginLink = NavLink('Log in', '/login');
	const signInLink = NavLink('Sign in', '/register');

	buttons.appendChild(loginLink);
	buttons.appendChild(signInLink);
	header.appendChild(buttons);

	return header;
}
