/**
 * History Manager - Handles browser history state for overlays, modals, and tabs
 * This allows proper back button behavior without using query parameters
 */

type HistoryStateType = 'base' | 'tab' | 'game' | 'modal';

interface HistoryState {
	type: HistoryStateType;
	data?: any;
}

type StateHandler = (state: HistoryState) => void;

class HistoryManager {
	private handlers: Map<HistoryStateType, StateHandler[]> = new Map();

	constructor() {
		window.addEventListener('popstate', this.handlePopState.bind(this));
	}

	/**
	 * Push a new state to history
	 */
	pushState(
		type: HistoryStateType,
		data?: any,
		url: string = window.location.pathname
	) {
		const state: HistoryState = { type, data };
		history.pushState(state, '', url);
	}

	/**
	 * Replace current state
	 */
	replaceState(
		type: HistoryStateType,
		data?: any,
		url: string = window.location.pathname
	) {
		const state: HistoryState = { type, data };
		history.replaceState(state, '', url);
	}

	/**
	 * Register a handler for a specific state type
	 */
	on(type: HistoryStateType, handler: StateHandler) {
		if (!this.handlers.has(type)) {
			this.handlers.set(type, []);
		}
		this.handlers.get(type)!.push(handler);
	}

	/**
	 * Remove a handler
	 */
	off(type: HistoryStateType, handler: StateHandler) {
		const typeHandlers = this.handlers.get(type);
		if (typeHandlers) {
			const index = typeHandlers.indexOf(handler);
			if (index > -1) {
				typeHandlers.splice(index, 1);
			}
		}
	}

	/**
	 * Handle popstate event (back/forward button)
	 */
	private handlePopState(event: PopStateEvent) {
		const state = event.state as HistoryState | null;

		if (!state) {
			// No state means we're at the base URL
			const handlers = this.handlers.get('base');
			if (handlers) {
				handlers.forEach((handler) => handler({ type: 'base' }));
			}
			return;
		}

		const handlers = this.handlers.get(state.type);
		if (handlers) {
			handlers.forEach((handler) => handler(state));
		}
	}

	/**
	 * Go back in history
	 */
	back() {
		history.back();
	}

	/**
	 * Get current state
	 */
	getCurrentState(): HistoryState | null {
		return history.state as HistoryState | null;
	}
}

// Export singleton instance
export const historyManager = new HistoryManager();
