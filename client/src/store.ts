type User = {
	id: number;
	username: string;
	avatar: string;
	email: string;
	friendRequests?: {
		senderId: number;
		senderUsername: string;
		senderAvatar: string;
	}[];
	friends?: {
		id: number;
		username: string;
		avatar: string;
	}[];
};

type State = {
	user: User | null;
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
