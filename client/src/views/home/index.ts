import { Container, Card } from '../../components';
import GameSection from './game-section';

export default function Home() {
	const container = Container({
		classes: [
			'grid',
			'gap-4',
			'min-h-[calc(100vh-5.5rem)]',
			'my-4',
			'grid-rows-2',
			'lg:grid-cols-3',
			'lg:grid-rows-1',
			'lg:gap-6',
			'lg:my-6',
			'lg:min-h-[calc(100vh-6.5rem)]',
		],
	});
	const authSection = Card({ element: 'section' });
	const historySection = Card({
		element: 'section',
		classes: ['hidden'],
	});

	container.appendChild(GameSection());
	container.appendChild(authSection);
	container.appendChild(historySection);
	return container;
}
