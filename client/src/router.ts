import Header from './layout/header';
import Home from './views/home';
// import Game from './views/game/game';
import { showGameOverlay } from './views/game/game-overlay';

export class Router {
	private rootElement: HTMLElement | null = document.getElementById('app');
	private routes: { [key: string]: () => Node };

	constructor() {
		this.routes = {
			'/': Home,
			'/game': () => {
				const gameId = getGameIdFromUrl();
				const home = Home();
				if (gameId) showGameOverlay(gameId, 'network');

				return home;
			},
		};

		window.addEventListener('popstate', this.loadRoute.bind(this));
		document.body.addEventListener('click', (event) => {
			const target = event.target as HTMLAnchorElement;
			if (target.matches('[data-link]')) {
				event.preventDefault();
				this.navigateTo(target.href);
			}
		});

		this.loadRoute();
	}

	navigateTo(url: string) {
		history.pushState(null, '', url);
		this.loadRoute();
	}

	private loadRoute() {
		const path = location.pathname;

		const view = this.routes[path];
		if (this.rootElement) {
			this.rootElement.innerHTML = '';
			this.rootElement.appendChild(Header());
			this.rootElement.appendChild(view());
		}
	}
}

function getGameIdFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return params.get('gameId');
}
