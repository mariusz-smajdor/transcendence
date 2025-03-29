import Register from './views/register.js';
import Login from './views/login.js';
import NotFound from './views/notfound.js';

export class Router {
	private routes: { [key: string]: () => string };

	constructor() {
		this.routes = {
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
		history.pushState(null, '', url);
		this.loadRoute();
	}

	private loadRoute() {
		const path = location.pathname;
		const view = this.routes[path] || NotFound;
		document.getElementById('app')!.innerHTML = view();
	}
}
