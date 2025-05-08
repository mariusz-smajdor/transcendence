export class PlayersManager {
    leftPlayer = null;
    rightPlayer = null;
    spectators = new Set();
    roles = new Map();
    
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
            console.log('Left player left the game');
        } else if (role == 'right') {
            this.rightPlayer = null;
            console.log('Right player left the game');
        } else {
            this.spectators.delete(connection);
        }
    }
}

export const playersManager = new PlayersManager();