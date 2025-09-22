import { type UserData } from './types/user';

type Message = {
	sender: number;
	receiver: number;
	message: string;
	read: boolean;
};

type State = {
	user: UserData | null;
	api_url: string;
	messages: Message[];
};

type StoreEvent = 'userUpdated' | 'messagesUpdated';

class Store {
	private state: State = {
		user: null,
		api_url: 'http://localhost:3000',
		messages: [],
	};
	private listeners: Map<StoreEvent, Function[]> = new Map();

	getState(): State {
		return this.state;
	}

	setState(newState: Partial<State>) {
		const oldState = { ...this.state };
		this.state = { ...this.state, ...newState };

		// Emit events for specific changes
		if (newState.user && newState.user !== oldState.user) {
			this.emit('userUpdated', newState.user);
		}
		if (newState.messages && newState.messages !== oldState.messages) {
			this.emit('messagesUpdated', newState.messages);
		}
	}

	on(event: StoreEvent, callback: Function) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(callback);
	}

	off(event: StoreEvent, callback: Function) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			const index = eventListeners.indexOf(callback);
			if (index > -1) {
				eventListeners.splice(index, 1);
			}
		}
	}

	private emit(event: StoreEvent, data?: any) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.forEach((callback) => callback(data));
		}
	}
}

export const store = new Store();
