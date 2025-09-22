export type UserData = {
	id: number;
	username: string;
	email: string;
	avatar?: string;
	friendRequests?: {
		id: number;
		senderId: number;
		senderUsername: string;
		senderEmail: string;
	}[];
	friends?: {
		id: number;
		username: string;
		email: string;
	}[];
};

export type User = UserData<Omit<friendRequests, friends>>;
