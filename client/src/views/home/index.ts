import GameSection from './game-section';
import AuthSection from './auth-section';
import HistorySection from './history-section';
import { Container } from '../../components/container';
import { Card } from '../../components/card';

// TEMPORARY HARDCODED USER, LATER WE WILL GET HIM FROM THE COOKIES
const user = {
	name: 'John Doe',
	avatar: 'https://i.pravatar.cc/300',
};
// const user = false;

// SELECT * FROM history WHERE user1_id = user_id OR user2_id = user_id ORDER BY date DESC LIMIT 10;
// nie wiem czy to jest valid syntax ale normalnie dodamy coś takiego

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

export default function Home() {
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

	container.appendChild(GameSection(user));
	container.appendChild(user ? FriendsSection() : AuthSection());
	user && container.appendChild(HistorySection(user));
	return container;
}
