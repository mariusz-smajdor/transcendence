import GameSection from './game-section';
import Auth from './AuthSection';
import { Container } from '../../components/container';
import { store } from '../../store';
import Friends from './Friends';
import History from './History';

export default function Home() {
	// const USER = {
	// 	name: 'John Doe',
	// 	avatar: 'https://i.pravatar.cc/300',
	// };

	const container = Container({
		classes: [
			'grid',
			'gap-4',
			'lg:h-[calc(100vh-6.5rem)]',
			'my-4',
			'lg:grid-cols-5',
			'lg:gap-6',
			'lg:my-6',
		],
	});

	const user = store.getState().user;

	container.appendChild(GameSection());
	container.appendChild(user ? Friends() : Auth());
	user && container.appendChild(History(user));
	return container;
}
