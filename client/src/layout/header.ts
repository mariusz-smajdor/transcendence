import { CircleMinus } from 'lucide';

import { Container } from '../components/container';
import { Wrapper } from '../components/wrapper';
import { Icon } from '../components/icon';
import { Title } from '../components/title';

function Logo() {
	const wrapper = Wrapper({
		classes: ['flex', 'items-center', 'gap-2', 'cursor-pointer', 'select-none'],
	});
	wrapper.addEventListener('click', () => {
		window.location.href = '/';
	});

	const title = Title({
		level: 2,
		content: 'Super Pong',
		classes: ['text-nowrap'],
	});
	const icon = Icon({ icon: CircleMinus });

	wrapper.appendChild(icon);
	wrapper.appendChild(title);

	return wrapper;
}

export default function Header() {
	const header = document.createElement('header');
	header.classList.add(
		'flex',
		'items-center',
		'h-14',
		'w-full',
		'border-b',
		'border-border'
	);

	const container = Container({
		classes: ['flex', 'items-center'],
	});

	container.appendChild(Logo());
	header.appendChild(container);
	return header;
}
