function handleReadyKey(ws: WebSocket, e: KeyboardEvent) {
	if (e.key === 'r' || e.key === 'R') {
		ws.send(JSON.stringify({ type: 'status', status: 'READY' }));
	}
}

const pressedKeys = new Set<string>();
let movementInterval: number | null = null;

export function setupKeyboardControls(ws: WebSocket) {
	document.addEventListener('keydown', (e: KeyboardEvent) => {
		if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();
		}

		if (!pressedKeys.has(e.key)) {
			pressedKeys.add(e.key);

			// Start continuous movement if not already running
			if (!movementInterval) {
				movementInterval = setInterval(() => {
					// Send movement for each pressed key
					pressedKeys.forEach((key) => {
						if (key === 'w' || key === 'W' || key === 'ArrowUp') {
							ws.send(moveSend('UP'));
						} else if (key === 's' || key === 'S' || key === 'ArrowDown') {
							ws.send(moveSend('DOWN'));
						}
					});
				}, 50); // 20 FPS - more reliable than 16ms
			}

			// Send initial movement command immediately
			if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
				ws.send(moveSend('UP'));
			} else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
				ws.send(moveSend('DOWN'));
			}
		}

		handleReadyKey(ws, e);
	});

	document.addEventListener('keyup', (e: KeyboardEvent) => {
		pressedKeys.delete(e.key);

		// Stop continuous movement if no keys are pressed
		if (pressedKeys.size === 0 && movementInterval) {
			clearInterval(movementInterval);
			movementInterval = null;
		}
	});
}

export function setupKeyboardControlsForLocal(ws: WebSocket) {
	document.addEventListener('keydown', (e: KeyboardEvent) => {
		if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();
		}

		if (!pressedKeys.has(e.key)) {
			pressedKeys.add(e.key);

			// Start continuous movement if not already running
			if (!movementInterval) {
				movementInterval = setInterval(() => {
					// Send movement for each pressed key
					pressedKeys.forEach((key) => {
						if (key === 'w' || key === 'W') {
							ws.send(moveSend('LEFT_UP'));
						} else if (key === 's' || key === 'S') {
							ws.send(moveSend('LEFT_DOWN'));
						} else if (key === 'ArrowUp') {
							ws.send(moveSend('RIGHT_UP'));
						} else if (key === 'ArrowDown') {
							ws.send(moveSend('RIGHT_DOWN'));
						}
					});
				}, 100); // 10 FPS - more reliable than 16ms
			}

			// Send initial movement command immediately
			if (e.key === 'w' || e.key === 'W') {
				ws.send(moveSend('LEFT_UP'));
			}
			if (e.key === 's' || e.key === 'S') {
				ws.send(moveSend('LEFT_DOWN'));
			}
			if (e.key === 'ArrowUp') {
				ws.send(moveSend('RIGHT_UP'));
			}
			if (e.key === 'ArrowDown') {
				ws.send(moveSend('RIGHT_DOWN'));
			}
		}

		handleReadyKey(ws, e);
	});

	document.addEventListener('keyup', (e: KeyboardEvent) => {
		pressedKeys.delete(e.key);

		// Stop continuous movement if no keys are pressed
		if (pressedKeys.size === 0 && movementInterval) {
			clearInterval(movementInterval);
			movementInterval = null;
		}
	});
}

function moveSend(direction: string): string {
	return JSON.stringify({ type: 'move', direction: direction });
}
