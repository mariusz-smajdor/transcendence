export class PlayersManager {
	leftPlayer = null;
	rightPlayer = null;
	spectators = new Set(); 	// connection...
	roles = new Map(); 			// connection: role
	authenticated = new Map(); 	// connection: token
	stats = new Map(); 			// role: {id , username, score}

	assignRole(connection) {
		let role = 'spectator';
		if (!this.leftPlayer) {
			this.leftPlayer = connection;
			role = 'left';
			console.log('Left player joined');
		} else if (!this.rightPlayer) {
			this.rightPlayer = connection;
			role = 'right';
			console.log('Right player joined');
		} else {
			this.spectators.add(connection);
			console.log('Spectator joined');
		}
		this.roles.set(connection, role);
	}

	setRole(connection,role = 'spectator'){
		if(role === 'left'){
			this.leftPlayer = connection;
			role = 'left';
		}
		else if (role === 'right'){
			this.rightPlayer = connection;
			role = 'right';
		}
		else
			this.spectators.add(connection)
		this.roles.set(connection, role);
	}

	getRole(connection) {
		return this.roles.get(connection);
	}

	playersPresence(){
		if (this.leftPlayer && this.rightPlayer)
			return true;
		return false;
	}

	removeRole(connection) {
		const role = this.roles.get(connection);
		if (role == 'left') {
			this.leftPlayer = null;
			this.roles.delete(connection)
			console.log('Left player left the game');
		} else if (role == 'right') {
			this.rightPlayer = null;
			this.roles.delete(connection)
			console.log('Right player left the game');
		} else {
			this.spectators.delete(connection);
			this.roles.delete(connection);
		}
	}

	removeTournamentRole(connection) {
		const role = this.roles.get(connection);
		if (role == 'left') {
			this.roles.delete(connection)
			console.log('Left player left the game');
		} else if (role == 'right') {
			this.roles.delete(connection)
			console.log('Right player left the game');
		} else {
			this.spectators.delete(connection);
			this.roles.delete(connection);
		}
	}

	removeRole(connection) {
		const role = this.roles.get(connection);
		if (role == 'left') {
			this.leftPlayer = null;
			this.roles.delete(connection)
			console.log('Left player left the game');
		} else if (role == 'right') {
			this.rightPlayer = null;
			this.roles.delete(connection)
			console.log('Right player left the game');
		} else {
			this.spectators.delete(connection);
			this.roles.delete(connection);
		}
	}

	setStats(connection, payload) {
		const role = this.roles.get(connection);
		//console.log("Player's stats set");
		this.stats.set(role, { id: payload.userId, username: payload.username, score: 0 });
	}

	updateScore(scores) {
		//console.log(scores);
		this.stats.get("left").score = scores.left;
		this.stats.get("right").score = scores.right;
	}

	checkActiveRoles(payload) {
		const left = this.stats.get('left')?.id;
		const right = this.stats.get('right')?.id;
		if (payload.userId === left || payload.userId === right)
			throw new Error("This user is already in the game");
	}

	removePlayer(connection) {
		const role = this.getRole(connection);
		this.clearSeat(role, connection);
		this.roles.delete(connection);
		this.authenticated.delete(connection);
		this.stats.delete(role);
	}

	clearSeat(role, connection) {
		switch (role) {
			case 'left':
				this.leftPlayer = null;
				break;
			case 'right':
				this.rightPlayer = null;
				break;
			case 'spectator':
				this.spectators.delete(connection);
				break;
		}
	}
}

// export const playersManager = new PlayersManager();