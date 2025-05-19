function handleReadyKey(ws: WebSocket, e: KeyboardEvent) {
    if (e.key === 'r' || e.key === 'R') {
        ws.send('READY');
    }
}

// function handleEscapeKey(ws: WebSocket, e: KeyboardEvent) {
//     if (e.key === 'Escape') {
//         ws.close();
//         window.history.pushState(null, '', '/');
//     }
// }

export function setupKeyboardControls(ws: WebSocket) {
	document.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') ws.send('UP');
		else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') ws.send('DOWN');
		handleReadyKey(ws, e);
	});
}

export function setupKeyboardControlsForLocal(ws: WebSocket) {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'w' || e.key === 'W') ws.send('LEFT_UP');
        else if (e.key === 's' || e.key === 'S') ws.send('LEFT_DOWN');
        else if (e.key === 'ArrowUp') ws.send('RIGHT_UP');
        else if (e.key === 'ArrowDown') ws.send('RIGHT_DOWN');
        handleReadyKey(ws, e);
    });
}
