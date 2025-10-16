import { Container } from '../components/container';

export default function NotFound() {
	const container = Container({
		classes: [
			'flex',
			'flex-col',
			'items-center',
			'justify-center',
			'min-h-screen',
			'px-4',
			'text-center',
		],
	});

	const iconWrapper = document.createElement('div');
	iconWrapper.className = 'mb-8 p-6 bg-red-100 dark:bg-red-900/20 rounded-full';

	const errorIcon = document.createElement('div');
	errorIcon.className = 'text-red-500 dark:text-red-400 text-6xl';
	errorIcon.innerHTML = '⚠️';

	const title = document.createElement('h1');
	title.className = 'text-6xl font-bold text-foreground mb-4';
	title.textContent = '404 - Page Not Found';

	const description = document.createElement('p');
	description.className = 'text-xl text-muted-foreground mb-8 max-w-2xl';
	description.textContent = "The page you're looking for doesn't exist or has been moved.";

	const homeButton = document.createElement('button');
	homeButton.className = 'px-8 py-3 text-lg font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors';
	homeButton.textContent = 'Go Home';

	homeButton.addEventListener('click', () => {
		// Navigate to home by updating history and triggering popstate
		history.pushState({ type: 'navigate' }, '', '/');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

	iconWrapper.appendChild(errorIcon);
	container.appendChild(iconWrapper);
	container.appendChild(title);
	container.appendChild(description);
	container.appendChild(homeButton);

	return container;
}