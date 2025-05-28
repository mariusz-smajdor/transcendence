function handleReadyKey(ws: WebSocket, e: KeyboardEvent) {
    if (e.key === 'r' || e.key === 'R') {
        ws.send(JSON.stringify({type: "status", status:'READY'}));
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
		if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') ws.send(moveSend('UP'));
		else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') ws.send(moveSend('DOWN'));
		handleReadyKey(ws, e);
	});
}

export function setupKeyboardControlsForLocal(ws: WebSocket) {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'w' || e.key === 'W') ws.send(moveSend('LEFT_UP'));
        else if (e.key === 's' || e.key === 'S') ws.send(moveSend('LEFT_DOWN'));
        else if (e.key === 'ArrowUp') ws.send(moveSend('RIGHT_UP'));
        else if (e.key === 'ArrowDown') ws.send(moveSend('RIGHT_DOWN'));
        handleReadyKey(ws, e);
    });
}

function moveSend(direction:string): string{
	return JSON.stringify({type: "move", direction: direction});
}
