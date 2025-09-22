function handleReadyKey(ws: WebSocket, e: KeyboardEvent) {
	if (e.key === 'r' || e.key === 'R') {
		ws.send(JSON.stringify({ type: 'status', status: 'READY' }));
	}
}

// Track key states for continuous movement
const keyStates = {
	w: false,
	s: false,
	ArrowUp: false,
	ArrowDown: false,
};

let movementInterval: NodeJS.Timeout | null = null;

function startMovement(ws: WebSocket) {
	if (movementInterval) return; // Already running

	movementInterval = setInterval(() => {
		if (keyStates.w || keyStates.ArrowUp) {
			ws.send(moveSend('UP'));
		}
		if (keyStates.s || keyStates.ArrowDown) {
			ws.send(moveSend('DOWN'));
		}
	}, 50); // Slower: ~20fps instead of 60fps
}

function stopMovement() {
	if (movementInterval) {
		clearInterval(movementInterval);
		movementInterval = null;
	}
}

export function setupKeyboardControls(ws: WebSocket) {
	document.addEventListener('keydown', (e: KeyboardEvent) => {
		// Prevent default behavior for game keys
		if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();
		}

		if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
			keyStates.w = true;
			keyStates.ArrowUp = true;
			startMovement(ws);
		} else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
			keyStates.s = true;
			keyStates.ArrowDown = true;
			startMovement(ws);
		}
		handleReadyKey(ws, e);
	});

	document.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
			keyStates.w = false;
			keyStates.ArrowUp = false;
		} else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
			keyStates.s = false;
			keyStates.ArrowDown = false;
		}

		// Stop movement if no keys are pressed
		if (
			!keyStates.w &&
			!keyStates.s &&
			!keyStates.ArrowUp &&
			!keyStates.ArrowDown
		) {
			stopMovement();
		}
	});
}

export function setupKeyboardControlsForLocal(ws: WebSocket) {
	// Track key states for local game (both players on same device)
	const localKeyStates = {
		w: false,
		s: false,
		ArrowUp: false,
		ArrowDown: false,
	};

	let localMovementInterval: NodeJS.Timeout | null = null;

	function startLocalMovement() {
		if (localMovementInterval) return;

		localMovementInterval = setInterval(() => {
			if (localKeyStates.w) ws.send(moveSend('LEFT_UP'));
			if (localKeyStates.s) ws.send(moveSend('LEFT_DOWN'));
			if (localKeyStates.ArrowUp) ws.send(moveSend('RIGHT_UP'));
			if (localKeyStates.ArrowDown) ws.send(moveSend('RIGHT_DOWN'));
		}, 50); // Slower: ~20fps instead of 60fps
	}

	function stopLocalMovement() {
		if (localMovementInterval) {
			clearInterval(localMovementInterval);
			localMovementInterval = null;
		}
	}

	document.addEventListener('keydown', (e: KeyboardEvent) => {
		// Prevent default behavior for game keys
		if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();
		}

		if (e.key === 'w' || e.key === 'W') {
			localKeyStates.w = true;
			startLocalMovement();
		} else if (e.key === 's' || e.key === 'S') {
			localKeyStates.s = true;
			startLocalMovement();
		} else if (e.key === 'ArrowUp') {
			localKeyStates.ArrowUp = true;
			startLocalMovement();
		} else if (e.key === 'ArrowDown') {
			localKeyStates.ArrowDown = true;
			startLocalMovement();
		}
		handleReadyKey(ws, e);
	});

	document.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.key === 'w' || e.key === 'W') {
			localKeyStates.w = false;
		} else if (e.key === 's' || e.key === 'S') {
			localKeyStates.s = false;
		} else if (e.key === 'ArrowUp') {
			localKeyStates.ArrowUp = false;
		} else if (e.key === 'ArrowDown') {
			localKeyStates.ArrowDown = false;
		}

		// Stop movement if no keys are pressed
		if (
			!localKeyStates.w &&
			!localKeyStates.s &&
			!localKeyStates.ArrowUp &&
			!localKeyStates.ArrowDown
		) {
			stopLocalMovement();
		}
	});
}

function moveSend(direction: string): string {
	return JSON.stringify({ type: 'move', direction: direction });
}
