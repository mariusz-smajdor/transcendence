import { Languages } from 'lucide';
import { Wrapper } from '../components/wrapper';
import { Container } from '../components/container';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Button } from '../components/button';
import { Text } from '../components/text';

function Menu() {
	const menu = Wrapper({});
	const languagesButton = Button({
		variant: 'ghost',
	});
	const languagesIcon = Icon({ icon: Languages });

	languagesButton.appendChild(languagesIcon);
	menu.appendChild(languagesButton);

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
