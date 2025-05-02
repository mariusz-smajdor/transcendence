import GameSection from './game-section';
import AuthSection from './auth-section';
import { Container } from '../../components/container';
import { Card } from '../../components/card';

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
	const historySection = Card({
		element: 'section',
		classes: ['hidden'],
	});

	container.appendChild(GameSection());
	container.appendChild(AuthSection());
	container.appendChild(historySection);
	return container;
}
