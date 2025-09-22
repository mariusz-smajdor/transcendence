import GameSection from './game-section';
import Auth from './AuthSection';
import { Container } from '../../components/container';
import { store } from '../../store';
import Friends from './Friends';

export default function Home() {
	const container = Container({
		classes: [
			'grid',
			'gap-4',
			'min-h-[calc(100vh-5.5rem)]',
			'my-4',
			'grid-rows-2',
			'lg:grid-cols-5',
			'lg:grid-rows-1',
			'lg:gap-6',
			'lg:my-6',
			'lg:min-h-[calc(100vh-6.5rem)]',
		],
	});

	const user = store.getState().user;

	container.appendChild(GameSection());
	container.appendChild(user ? Friends() : Auth());
	return container;
}
