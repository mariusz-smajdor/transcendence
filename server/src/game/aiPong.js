
export function startAI(game, ballSpeed) {
	let aiMove = 0;
	let id = setInterval(() => {
		if (!game.isRunning) return;
		
        const { ball, paddles } = game.gameState;		
        const paddleY = paddles.right;
        const paddleHeight = 60;
        const fieldHeight = 400;
		const middleHeight = 200;
        // ball prediction in a second 
        let predictedY = ball.y;
        let vy = ballSpeed.ballSpeedY;
        let y = ball.y;
        let time = 0;
        const dt = 20;
	
		let centerPaddle = paddleY + paddleHeight / 2;
		if (ballSpeed.ballSpeedX > 0){
			while (time < 1000) {
				y += vy // 50;
				if (y - 10 < 0 || y + 10 > fieldHeight) {
					vy = -vy;
					y = Math.max(10, Math.min(fieldHeight - 10, y));
				}
				time += dt;
			}
			predictedY = y;
			
			// number of moves for right position
				let diff = predictedY - centerPaddle;
				aiMove = Math.max(-9, Math.min(9, Math.round(diff / 20)));
		}
		else if (ballSpeed.ballSpeedX < 0) {
			let diff = middleHeight - centerPaddle;
			aiMove = Math.max(-9, Math.min(9, Math.round(diff / 20)));
        }
    }, 1000);

	game.intervalId.add(id);

	// ai moves like human
    id = setInterval(() => {
        if (!game.isRunning) return;
        if (aiMove !== 0) {
            if (aiMove > 0) {
                game.gameState.paddles.right = Math.min(340, game.gameState.paddles.right + 20);
                aiMove--;
            } else if (aiMove < 0) {
                game.gameState.paddles.right = Math.max(0, game.gameState.paddles.right - 20);
                aiMove++;
            }
        }
    }, 100);

	game.intervalId.add(id);

}
