import Game from './Game';
import Auth from './AuthSection';
import History from './History';
import Friends from './Friends';
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

	container.appendChild(Game());
	container.appendChild(user ? Friends() : Auth());
	user && container.appendChild(History(USER));
	return container;
}

export default Home;
