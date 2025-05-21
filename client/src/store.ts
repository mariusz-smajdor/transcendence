import { type UserData } from './types/user';

type State = {
	user: UserData | null;
	api_url: string;
};

class Store {
	private state: State = {
		user: null,
		api_url: "http://localhost:3000"
	};

	getState(): State {
		return this.state;
	}

	setState(newState: Partial<State>) {
		this.state = { ...this.state, ...newState };
	}
}

export const store = new Store();
