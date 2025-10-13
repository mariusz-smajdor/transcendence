import Header from './layout/header';
import Home from './views/home';
import { closeGameOverlay } from './views/game/game-overlay';
import { historyManager } from './utils/historyManager';

export class Router {
	private rootElement: HTMLElement | null = document.getElementById('app');
	private routes: { [key: string]: () => Node };

	constructor() {
		this.routes = {
			'/': Home,
		};

		// Set up history handlers
		this.setupHistoryHandlers();

		window.addEventListener('popstate', this.loadRoute.bind(this));
		document.body.addEventListener('click', (event) => {
			const target = event.target as HTMLAnchorElement;
			if (target.matches('[data-link]')) {
				event.preventDefault();
				this.navigateTo(target.href);
			}
		});

		// Initialize with base state
		if (!history.state) {
			historyManager.replaceState('base', null, '/');
		}

		this.loadRoute();
	}

	private setupHistoryHandlers() {
		// Handle game overlay close on back button
		historyManager.on('game', () => {
			// If going back TO a game state (shouldn't happen normally)
			// Game overlay is already shown, do nothing
		});

		historyManager.on('base', () => {
			// Close any open overlays when going back to base state
			closeGameOverlay();
		});

		historyManager.on('tab', () => {
			// Close game overlay if open when navigating to a tab
			// This handles the browser back button from tournament game
			const overlay = document.getElementById('game-modal');
			if (overlay) {
				closeGameOverlay();
			}
			// Tabs handle their own history
		});

		historyManager.on('modal', () => {
			// Modals handle their own history
		});
	}

	navigateTo(url: string) {
		historyManager.pushState('base', null, url);
		this.loadRoute();
	}

	private loadRoute() {
		// Close any active game overlay when navigating to different routes
		const currentState = historyManager.getCurrentState();
		if (currentState?.type !== 'game') {
			closeGameOverlay();
		}

		// Cleanup any existing invitation handlers before re-rendering
		this.cleanupInvitationHandlers();

		const path = location.pathname;

		const view = this.routes[path] || this.routes['/'];
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
