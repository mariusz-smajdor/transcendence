import { Container } from '../components/container.js';
import { Title } from '../components/title.js';
import { Icon } from '../components/icon.js';

function LogoWrapper() {
	const wrapper = document.createElement('div');
	wrapper.classList.add('flex', 'items-center', 'gap-2');
	return wrapper;
}

export default function Header(): HTMLElement {
	const header: HTMLElement = document.createElement('header');
	header.classList.add('flex', 'items-center', 'w-full', 'h-14', 'shadow-sm');

	const container = Container();
	const logoWrapper = LogoWrapper();
	logoWrapper.appendChild(
		Icon({
			name: ['fa-solid', 'fa-table-tennis-paddle-ball'],
			classes: ['text-xl'],
		})
	);
	logoWrapper.appendChild(Title({ level: 2, content: 'Super Pong' }));
	container.appendChild(logoWrapper);
	header.appendChild(container);
	return header;
}
