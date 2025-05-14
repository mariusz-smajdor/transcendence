type User = {
	id: number;
	username: string;
	avatar: string;
	email: string;
};

type State = {
	token: string | null;
	user: User | null;
};

class Store {
	private state: State = {
		token: null,
		user: null,
	};

	getState(): State {
		return this.state;
	}

	setState(newState: Partial<State>) {
		this.state = { ...this.state, ...newState };
	}
}

export const store = new Store();
