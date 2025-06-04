import { broadcastStatus } from "./broadcast.js";

export function authenticateToken(game, connection, fastify, msg){
	if (!game.playersManager.authenticated.has(connection)) {
		if (msg.type === 'auth' && msg.token) {
			try {
				let payload = fastify.jwt.verify(msg.token);
				console.log(payload);
				//game.playersManager.checkActiveRoles(payload);
				game.playersManager.authenticated.set(connection, msg.token);
				game.playersManager.setStats(connection,payload);
				broadcastStatus(game.clients, 'nickname',{
					left: game.playersManager.stats.get('left')?.username ?? 'Left',
					right: game.playersManager.stats.get('right')?.username ?? 'Right'});
			} catch (err) {
				console.log(err.message)
				connection.close();
			}
		} else {
			console.log("not authenticated");
			connection.close();
		}
		return;
	}     
}
