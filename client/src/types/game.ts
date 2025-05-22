export type GameState = {
    leftPaddleY: number;
    rightPaddleY: number;
    ballX: number;
    ballY: number;
    scoreLeft: number;
    scoreRight: number;
    playerRole: 'left' | 'right' | 'spectator';
    gameOver: boolean;
};

export type UIElements = {
    game: HTMLElement;
    text: HTMLElement;
    roleText: HTMLElement;
    restartBtn: HTMLElement;
};

export type UIActions = {
    drawScene: () => void;
    resizeCanvas: () => void;
};

export type GameUI = {
    ui: UIElements;
    gameState: GameState;
    actions: UIActions;
};

export type GameType = 'network' | 'local' | 'ai';