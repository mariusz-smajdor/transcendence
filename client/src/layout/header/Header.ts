import Logo from './Logo';
import Menu from './Menu';
import { Container } from '../../components/container';

export default function Header() {
	const header = document.createElement('header');
	header.classList.add(
		'fixed',
		'top-0',
		'z-50',
		'flex',
		'h-14',
		'w-full',
		'items-center',
		'border-b',
		'border-accent',
		'backdrop-blur-sm',
		'bg-background/50'
	);
	const container = Container({
		classes: ['flex', 'items-center', 'justify-between'],
	});

	container.appendChild(Logo());
	container.appendChild(Menu());
	header.appendChild(container);

	return header;
}
