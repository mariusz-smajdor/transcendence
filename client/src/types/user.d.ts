export type UserData = {
	id: number;
	username: string;
	email: string;
	avatar?: string;
	google_id?: string | null;
	friendRequests?: {
		id: number;
		senderId: number;
		senderUsername: string;
		senderEmail: string;
		senderAvatar?: string;
	}[];
	friends?: {
		id: number;
		username: string;
		email: string;
		avatar?: string;
	}[];
};

export type User = UserData<Omit<friendRequests, friends>>;
