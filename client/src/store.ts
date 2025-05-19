import { type UserData } from './types/user';

type State = {
	user: UserData | null;
};

class Store {
	private state: State = {
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
