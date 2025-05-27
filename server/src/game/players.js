export class PlayersManager {
    leftPlayer = null;
    rightPlayer = null;
    spectators = new Set();
    roles = new Map();
	//users = new Map(); // {connection {token }}
	authenticated = new Map();
	stats = new Map();
    
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

    getRole(connection) {
        return this.roles.get(connection);
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
	setStats(connection, payload){
		const role = this.roles.get(connection);
		this.stats.set(role,{id: payload.userId, username: payload.username, score: 0});
	}
	updateScore(scores){
		console.log(scores);
		this.stats.get("left").score = scores.left;
		this.stats.get("right").score = scores.right;
	}
}

// export const playersManager = new PlayersManager();