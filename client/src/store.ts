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

class Store {
	private state: State = {
		user: null,
		api_url: 'http://localhost:3000',
		messages: [],
	};

	getState(): State {
		return this.state;
	}

	setState(newState: Partial<State>) {
		this.state = { ...this.state, ...newState };
	}
}

export const store = new Store();
