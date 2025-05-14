import GameSection from './game-section';
import AuthSection from './auth-section';
import HistorySection from './history-section';
import FriendsSection from './friends-section';
import { Container } from '../../components/container';
import { store } from '../../store';

// TEMPORARY HARDCODED USER, LATER WE WILL GET HIM FROM BACKEND
const USER = {
	name: 'John Doe',
	avatar: 'https://i.pravatar.cc/300',
};
////////////////////////////////////////////////////////////////////

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
