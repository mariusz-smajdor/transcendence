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
            console.log('Gracz lewy dołączył');
        } else if (!this.rightPlayer) {
            this.rightPlayer = connection;
            role = 'right';
            console.log('Gracz prawy dołączył');
        } else {
            this.spectators.add(connection);
            console.log('Dołączył obserwator');
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
            console.log('Gracz lewy opuścił grę');
        } else if (role == 'left') {
            this.rightPlayer = null;
            console.log('Gracz prawy opuścił grę');
        } else {
            this.spectators.delete(connection);
        }
    }
}

export const playersManager = new PlayersManager();