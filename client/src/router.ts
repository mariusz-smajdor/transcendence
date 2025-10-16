import Header from './layout/header';
import Home from './views/home';
import NotFound from './views/404';
import { closeGameOverlay } from './views/game/game-overlay';

export class Router {
	private rootElement: HTMLElement | null = document.getElementById('app');
	private routes: { [key: string]: () => Node };

	constructor() {
		this.routes = {
			'/': Home,
		};

		// Add browser navigation support
		window.addEventListener('popstate', () => {
			this.loadRoute();
		});

		document.body.addEventListener('click', (event) => {
			const target = event.target as HTMLAnchorElement;
			if (target.matches('[data-link]')) {
				event.preventDefault();
				// prefer pathname to avoid full reloads
				this.navigateTo(target.getAttribute('href') || target.pathname || '/');
			}
		});

		// No history initialization needed

		this.loadRoute();
	}

	// history handlers removed - navigation is purely client-side rendering

	navigateTo(url: string) {
		// Accept either full URL or path; normalize to pathname
		try {
			const parsed = new URL(url, window.location.origin);
			url = parsed.pathname;
		} catch (e) {
			// ignore and use as-is
		}
		
		// Update browser history
		history.pushState({ type: 'navigate' }, '', url);
		
		// Load the route
		this.loadRoute();
	}

	private loadRoute() {
		// Close any active game overlay when navigating to different routes
		closeGameOverlay();

		// Cleanup any existing invitation handlers before re-rendering
		this.cleanupInvitationHandlers();

		const path = location.pathname;

		// Only allow home route, redirect everything else to 404
		let view: (() => Node) | undefined;
		
		if (path === '/') {
			view = this.routes['/'];
		} else {
			// Any URL other than "/" goes to 404
			view = NotFound;
		}

		if (this.rootElement) {
			this.rootElement.innerHTML = '';
			this.rootElement.appendChild(Header());
			this.rootElement.appendChild(view());
		}
	}

	private cleanupInvitationHandlers() {
		// Find and cleanup any existing invitation handlers
		const friendsWrapper = document.querySelector(
			'[data-friends-wrapper]'
		) as HTMLElement;
		if (friendsWrapper && (friendsWrapper as any).__cleanupInvitationHandlers) {
			(friendsWrapper as any).__cleanupInvitationHandlers();
		}
	}
}
