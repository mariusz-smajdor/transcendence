import { Container } from '../components/container';
import { Paragraph } from '../components/paragraph';
import { Title } from '../components/title';

export default function Home() {
	const home = Container({ element: 'main' });
	const title = Title({ level: 1, content: 'Home' });
	const paragraph = Paragraph({
		content: 'Welcome to the home page!',
	});

	home.appendChild(title);
	home.appendChild(paragraph);

	return home;
}
