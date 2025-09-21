import { broadcastStatus } from "./broadcast.js";

export function authenticateToken(game, connection, fastify, msg){
	let payload;
	if (game.playersManager.authenticated.has(connection))
		return;
	if (!game.playersManager.authenticated.has(connection)) {
		if (msg.type === 'auth' && msg.token) {
			try {
				payload = fastify.jwt.verify(msg.token);
				game.needAuthentication = 2;
			} catch (err) {
				if (game.needAuthentication === 2){
					console.log(err.message);
					connection.close();
				} else if (game.needAuthentication === 1){
					console.log("The result of the game won't be saved to database")
					game.needAuthentication = 0;
				}
				return;
			}
		} else {	
			if (game.needAuthentication === 2){
				console.log("Authentication required: player is not authorized");
				connection.close();
			} else if (game.needAuthentication === 1){
				console.log("The result of the game won't be saved to database");
				game.needAuthentication = 0;
			}
			return;
		}
	}
	setPlayerStats(game,connection,msg,payload);
}

export function setPlayerStats(game,connection,msg,payload){
	try{
		//game.playersManager.checkActiveRoles(payload);
		game.playersManager.authenticated.set(connection, msg.token);
		game.playersManager.setStats(connection,payload);
		broadcastStatus(game.clients, 'nickname',{
			left: game.playersManager.stats.get('left')?.username ?? 'Left',
			right: game.playersManager.stats.get('right')?.username ?? 'Right'});
	} catch (err) {
		console.log(err.message);
		connection.close;
		return;
	}
}

