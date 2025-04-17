import Home from './views/home.js';
import Register from './views/register.js';
import Login from './views/login.js';
import NotFound from './views/notfound.js';
import Header from './layout/header.js';

export class Router {
	private rootElement: HTMLElement | null = document.getElementById('app');
	private routes: { [key: string]: () => Node };

	constructor() {
		this.routes = {
			'/': Home,
			'/login': Login,
			'/register': Register,
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
		console.log(url);
		alert('Navigating to ' + url);
		history.pushState(null, '', url);
		this.loadRoute();
	}

	private loadRoute() {
		const path = location.pathname;
		const view = this.routes[path] || NotFound;
		if (view !== NotFound) {
			this.rootElement!.appendChild(Header());
		}
		this.rootElement!.appendChild(view());
	}
}
