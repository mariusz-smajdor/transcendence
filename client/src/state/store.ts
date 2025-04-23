type User = {
	username: string;
	email: string;
	id: number;
};

type State = {
	accessToken: string | null;
	user: User | null;
};

type Listener = (state: State) => void;

class Store {
	private state: State = {
		accessToken: null,
		user: null,
	};

	private listeners: Listener[] = [];

	getState(): State {
		return this.state;
	}

	setState(newState: Partial<State>) {
		this.state = { ...this.state, ...newState };
		this.notify();
	}

	subscribe(listener: Listener) {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	private notify() {
		this.listeners.forEach((listener) => listener(this.state));
	}
}

export const store = new Store();
