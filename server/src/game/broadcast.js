export function broadcastGameState(clients, gameState) {
    for (const client of clients) {
        try {
          client.send(JSON.stringify({
                type: 'gameState',
                data: gameState
              }));
        } catch (err) {
          console.error('Error when sending:', err);
        }
    }
}

export function broadcastMessage(clients, message) {
    for (const client of clients) {
        try {
            client.send(JSON.stringify({
                type: 'message',
                message: message
            }));
        } catch (err) {
            console.error('Error when sending:', err);
        }
    }
}

export function broadcastStatus(clients, type, object){
	for (const client of clients) {
        try {
            client.send(JSON.stringify({
                type: type,
                object: object
            }));
        } catch (err) {
            console.error('Error when sending:', err);
        }
    }
}