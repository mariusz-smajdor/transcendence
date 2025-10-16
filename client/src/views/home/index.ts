import Auth from './AuthSection';
import { Container } from '../../components/container';
import { store } from '../../store';
import Friends from './Friends';
import History from './History';
import Game from './Game';
import {
	getCurrentLang,
	onLanguageChange,
} from '../../services/languageService';

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

	// Log current language initially
	console.log('[Home] current lang:', getCurrentLang());
	// Listen for language changes and log
	onLanguageChange((lang) => {
		console.log('[Home] language changed:', lang);
	});

	container.appendChild(Game());
	container.appendChild(user ? Friends() : Auth());
	user && container.appendChild(History(user));

	// Optional: clean up listener if Home component supports unmount lifecycle elsewhere.
	// Returning container only as this component is currently a pure function.
	return container;
}
