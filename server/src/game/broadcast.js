export function broadcastGameState(clients, gameState) {
    for (const client of clients) {
        try {
          client.send(JSON.stringify({
                type: 'gameState',
                data: gameState
              }));
        } catch (err) {
          console.error('Błąd przy wysyłaniu:', err);
        }
    }
}