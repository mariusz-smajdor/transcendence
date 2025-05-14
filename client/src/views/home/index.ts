import GameSection from './game-section';
import AuthSection from './auth-section';
import HistorySection from './history-section';
import { Container } from '../../components/container';
import { Card } from '../../components/card';
import { store } from '../../store';

// TEMPORARY HARDCODED USER, LATER WE WILL GET HIM FROM BACKEND
const USER = {
	name: 'John Doe',
	avatar: 'https://i.pravatar.cc/300',
};
////////////////////////////////////////////////////////////////////

function FriendsSection() {
	const section = Card({
		element: 'section',
		classes: [
			'flex',
			'flex-col',
			'gap-4',
			'lg:gap-6',
			'lg:col-span-2',
			'lg:row-span-2',
		],
	});

	return section;
}

function Home() {
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

	container.appendChild(GameSection(user));
	container.appendChild(user ? FriendsSection() : AuthSection());
	user && container.appendChild(HistorySection(USER));
	return container;
}

export default Home;
