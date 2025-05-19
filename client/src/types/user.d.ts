export type UserData = {
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

export type User = UserData<Omit<friendRequests, friends>>;
