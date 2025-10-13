#!/usr/bin/env node

import readline from 'readline';
import WebSocket from 'ws';
import https from 'https';
import fs from 'fs';

class TournamentCLI {
  constructor() {
    this.baseUrl = 'https://localhost:3000';
    this.token = null;
    this.username = null;
    this.sessionId = null;
    this.isAnonymous = false;
    this.currentRoom = null;
    this.wsConnection = null;
    this.invitationWs = null; // WebSocket connection for invitations/tournaments
    this.gameState = null;
    this.playerRole = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Disable SSL verification for localhost (development only)
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    
    // Generate session ID for anonymous play
    this.sessionId = this.generateSessionId();
  }

  async start() {
    console.log('🏆 Welcome to Tournament CLI! 🏆');
    await this.showMainMenu();
  }

  async showMainMenu() {
    console.log('\n=== MAIN MENU ===');
    console.log('1. Enter your nickname');
    console.log('2. List Tournaments');
    console.log('3. Create Tournament');
    console.log('4. Join Tournament');
    console.log('5. Exit');
    
    const choice = await this.askQuestion('Choose an option (1-5): ');
    
    switch(choice.trim()) {
      case '1':
        await this.playAnonymously();
        break;
      case '2':
        await this.listTournaments();
        break;
      case '3':
        await this.createTournament();
        break;
      case '4':
        await this.joinTournament();
        break;
      case '5':
        console.log('Goodbye! 👋');
        this.cleanup();
        process.exit(0);
        break;
      default:
        console.log('Invalid option. Please try again.');
        await this.showMainMenu();
    }
  }

  async playAnonymously() {
    console.log('\n=== PLAY ===');
    const username = await this.askQuestion('Enter your display name: ');
    
    if (!username.trim()) {
      console.log('❌ Display name cannot be empty');
      await this.showMainMenu();
      return;
    }
    
    this.username = username.trim();
    this.isAnonymous = true;
    this.token = null; // No token for anonymous play
    
    console.log(`✅ Playing as user: ${this.username}`);
    console.log(`   Session ID: ${this.sessionId}`);
    
    // Establish WebSocket connection for tournaments
    try {
      await this.establishWebSocketConnection();
    } catch (error) {
      console.log(`❌ Failed to establish WebSocket connection: ${error.message}`);
      console.log('You can still try to use tournament features, but they may not work properly.');
    }
    
    await this.showMainMenu();
  }

  async listTournaments() {
    if (!this.username) {
      console.log('❌ Please enter your nickname first');
      await this.showMainMenu();
      return;
    }

    console.log('\n=== AVAILABLE TOURNAMENTS ===');
    
    try {
      const response = await this.makeRequest('POST', '/tournament/rooms', {
        token: this.token,
        sessionId: this.sessionId
      });
      
      if (Array.isArray(response)) {
        if (response.length === 0) {
          console.log('No tournaments available');
        } else {
          response.forEach((tournament, index) => {
            const status = tournament.found ? '🎯 You are in this tournament' : '📋 Available to join';
            console.log(`${index + 1}. ${tournament.creator}'s Tournament`);
            console.log(`   ${status}`);
            console.log(`   Players: ${tournament.playersIn}/${tournament.playersExpected}`);
            console.log(`   Room ID: ${tournament.id}`);
            console.log('');
          });
        }
      } else if (response.found) {
        console.log('🎯 You are currently in a tournament:');
        console.log(`   Creator: ${response.creator}`);
        console.log(`   Players: ${response.playersIn}/${response.playersExpected}`);
        console.log(`   Room ID: ${response.id}`);
        if (response.matches) {
          console.log('   Tournament Status: In Progress');
        }
      }
      
      await this.showMainMenu();
    } catch (error) {
      console.log(`❌ Error fetching tournaments: ${error.message}`);
      await this.showMainMenu();
    }
  }

  async createTournament() {
    if (!this.username) {
      console.log('❌ Please play anonymously first');
      await this.showMainMenu();
      return;
    }

    console.log('\n=== CREATE TOURNAMENT ===');
    const numberOfPlayers = await this.askQuestion('Number of players (4, 8, or 16): ');
    
    const validNumbers = ['4', '8', '16'];
    if (!validNumbers.includes(numberOfPlayers)) {
      console.log('❌ Invalid number. Please choose 4, 8, or 16');
      await this.showMainMenu();
      return;
    }
    
    try {
      const response = await this.makeRequest('POST', '/tournament/create', {
        creator: this.username,
        token: this.token,
        sessionId: this.sessionId,
        numberOfPlayers: parseInt(numberOfPlayers)
      });
      
      if (response.id) {
        this.currentRoom = response.id;
        console.log(`✅ Tournament created successfully!`);
        console.log(`   Room ID: ${response.id}`);
        console.log(`   Players: ${response.playersIn}/${response.playersExpected}`);
        console.log('\nWaiting for players to join...');
        await this.waitForTournamentStart();
      } else {
        console.log(`❌ Failed to create tournament`);
        await this.showMainMenu();
      }
    } catch (error) {
      console.log(`❌ Error creating tournament: ${error.message}`);
      await this.showMainMenu();
    }
  }

  async joinTournament() {
    if (!this.username) {
      console.log('❌ Please play anonymously first');
      await this.showMainMenu();
      return;
    }

    console.log('\n=== JOIN TOURNAMENT ===');
    const roomId = await this.askQuestion('Enter Room ID: ');
    
    try {
      const response = await this.makeRequest('POST', '/tournament/join', {
        name: this.username,
        token: this.token,
        sessionId: this.sessionId,
        roomId: roomId
      });
      
      if (response.id) {
        this.currentRoom = response.id;
        console.log(`✅ Joined tournament successfully!`);
        console.log(`   Room ID: ${response.id}`);
        console.log(`   Players: ${response.playersIn}/${response.playersExpected}`);
        console.log('\nWaiting for tournament to start...');
        await this.waitForTournamentStart();
      } else {
        console.log(`❌ Failed to join tournament`);
        await this.showMainMenu();
      }
    } catch (error) {
      console.log(`❌ Error joining tournament: ${error.message}`);
      await this.showMainMenu();
    }
  }

  async waitForTournamentStart() {
    console.log('\n=== TOURNAMENT LOBBY ===');
    console.log('Commands:');
    console.log('  status - Check tournament status');
    console.log('  ready  - Start your match (if available)');
    console.log('  leave  - Leave tournament');
    console.log('  back   - Return to main menu');
    
    while (true) {
      const command = await this.askQuestion('\nTournament> ');
      
      switch(command.trim().toLowerCase()) {
        case 'status':
          await this.checkTournamentStatus();
          break;
        case 'ready':
        case 'r':
          await this.tryStartMatch();
          break;
        case 'leave':
          await this.leaveTournament();
          return;
        case 'back':
          await this.showMainMenu();
          return;
        default:
          console.log('Unknown command. Use: status, ready, leave, or back');
      }
    }
  }

  async tryStartMatch() {
    console.log('\n🎯 Checking for available match...');
    const gameId = await this.getPlayerMatch();
    
    if (gameId) {
      console.log(`✅ Match found! Game ID: ${gameId}`);
      await this.playMatch(gameId);
    } else {
      console.log('❌ No match available yet.');
      console.log('   Either the tournament hasn\'t started or you don\'t have a match to play.');
      console.log('   Use "status" to check tournament progress.');
    }
  }

  async checkTournamentStatus() {
    try {
      const response = await this.makeRequest('POST', '/tournament/rooms', {
        token: this.token,
        sessionId: this.sessionId
      });
      
      if (response.found) {
        console.log(`\nTournament Status:`);
        console.log(`  Players: ${response.playersIn}/${response.playersExpected}`);
        console.log(`  Creator: ${response.creator}`);
        
        if (response.matches && response.matches.length > 0) {
          console.log(`  Status: Tournament Started! 🎮`);
          console.log(`  Matches: ${response.matches.length}`);
          
          // Show tournament bracket if available
          if (response.positions) {
            this.displayTournamentBracket(response.positions, response.playersStatus);
          }
          
          // Check if player has a match to play
          const gameId = await this.getPlayerMatch();
          if (gameId) {
            console.log(`\n🎯 You have a match to play! Game ID: ${gameId}`);
            console.log(`   Type "ready" to start your match`);
          }
        } else {
          console.log(`  Status: Waiting for players... ⏳`);
        }
      }
    } catch (error) {
      console.log(`❌ Error checking status: ${error.message}`);
    }
  }

  displayTournamentBracket(positions, playersStatus) {
    console.log('\n🏆 TOURNAMENT BRACKET 🏆');
    console.log('='.repeat(50));
    
    if (!positions || !Array.isArray(positions)) {
      console.log('Bracket not available yet');
      return;
    }
    
    // Group positions by round
    const rounds = {};
    positions.forEach((pos, index) => {
      const round = Math.floor(index / 2) + 1;
      if (!rounds[round]) rounds[round] = [];
      rounds[round].push({
        position: index + 1,
        player: pos,
        status: playersStatus ? playersStatus[index] : 'waiting'
      });
    });
    
    // Display bracket
    Object.keys(rounds).forEach(roundNum => {
      console.log(`\nRound ${roundNum}:`);
      rounds[roundNum].forEach(match => {
        const statusIcon = this.getStatusIcon(match.status);
        console.log(`  ${statusIcon} Position ${match.position}: ${match.player || 'TBD'}`);
      });
    });
    
    console.log('\nLegend: 🎮 Playing | ✅ Won | ❌ Lost | ⏳ Waiting');
  }

  getStatusIcon(status) {
    switch(status) {
      case 'playing': return '🎮';
      case 'won': return '✅';
      case 'lost': return '❌';
      case 'waiting': return '⏳';
      default: return '❓';
    }
  }

  async getPlayerMatch() {
    try {
      const response = await this.makeRequest('POST', '/tournament/play', {
        roomId: this.currentRoom,
        token: this.token,
        sessionId: this.sessionId
      });
      
      return response.gameId;
    } catch (error) {
      return null;
    }
  }

  async playMatch(gameId) {
    console.log('\n=== PLAYING MATCH ===');
    console.log('Connecting to game...');
    
    const wsUrl = `wss://localhost:3000/tournament/match?gameId=${gameId}&roomId=${this.currentRoom}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.on('open', () => {
        console.log('✅ Connected to game!');
        console.log('⌨️  Game controls are now active');
        console.log('   Press R when ready to start');
        console.log('   Press Q to quit\n');
        
        this.wsConnection.send(JSON.stringify({
          type: 'auth',
          token: this.token,
          sessionId: this.sessionId
        }));
        
        // Set up keyboard controls immediately after connection
        this.setupGameInput();
      });
      
      this.wsConnection.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleGameMessage(message);
        } catch (error) {
          console.log('Invalid message format');
        }
      });
      
      this.wsConnection.on('close', () => {
        console.log('\n🔌 Game connection closed');
        this.wsConnection = null;
      });
      
      this.wsConnection.on('error', (error) => {
        console.log(`WebSocket error: ${error.message}`);
      });
      
      // Wait for game to finish
      await this.waitForGameFinish();
      
      console.log('\n✅ Match completed! Returning to tournament lobby...');
      
    } catch (error) {
      console.log(`❌ Error connecting to game: ${error.message}`);
    }
  }

  handleGameMessage(message) {
    // Debug: log all messages
    // console.log('Received message:', JSON.stringify(message));
    
    // Handle string messages (broadcast messages)
    if (typeof message === 'string') {
      if (message.includes('waiting_for_readiness')) {
        console.log('⏳ Waiting for players to be ready...');
        console.log('   Press R to signal you are READY!');
      } else if (message.includes('left_player_ready')) {
        console.log('👈 Left player is ready');
        if (this.playerRole === 'right') {
          console.log('   Press R to signal you are READY!');
        }
      } else if (message.includes('right_player_ready')) {
        console.log('👉 Right player is ready');
        if (this.playerRole === 'left') {
          console.log('   Press R to signal you are READY!');
        }
      } else if (message.includes('count_to_start')) {
        console.log('⏰ Game starting in 3...');
      } else if (message.includes('game_on')) {
        this.showGameControls();
      } else if (message.includes('match_finished')) {
        console.log('🏁 Match finished!');
        this.wsConnection.close();
      } else if (message.includes('The winner is:')) {
        console.log(`🏆 ${message}`);
      }
      return;
    }
    
    // Handle object messages
    if (typeof message === 'object') {
      // Server sends 'gameState' (not 'game_state')
      if (message.type === 'gameState' && message.data) {
        this.gameState = message.data;
        this.displayGameState();
        return;
      }
      
      // Server sends 'role' (not 'player_assignment')
      if (message.type === 'role') {
        this.playerRole = message.role;
        console.log(`🎯 You are playing as: ${this.playerRole === 'left' ? 'Left Player ◀️' : this.playerRole === 'right' ? 'Right Player ▶️' : 'Spectator 👁️'}`);
        return;
      }
      
      // Handle message.message format
      if (message.message) {
        if (message.message === 'waiting_for_readiness') {
          console.log('⏳ Waiting for players to be ready...');
          console.log('   Press R to signal you are READY!');
        } else if (message.message === 'left_player_ready') {
          console.log('👈 Left player is ready');
          if (this.playerRole === 'right') {
            console.log('   Press R to signal you are READY!');
          }
        } else if (message.message === 'right_player_ready') {
          console.log('👉 Right player is ready');
          if (this.playerRole === 'left') {
            console.log('   Press R to signal you are READY!');
          }
        }
      }
    }
  }

  displayGameState() {
    if (!this.gameState) return;
    
    // Clear screen and show game state
    console.clear();
    console.log('🏓 PONG GAME 🏓');
    console.log('='.repeat(60));
    
    // Show scores
    const leftScore = this.gameState.score?.left || 0;
    const rightScore = this.gameState.score?.right || 0;
    console.log(`Score:  Left ${leftScore}  -  ${rightScore} Right`);
    console.log('='.repeat(60));
    
    // Game field dimensions
    const fieldHeight = 20;
    const fieldWidth = 40;
    
    // Get positions (gameState uses proportional values 0-1)
    const leftPaddle = Math.floor((this.gameState.paddles?.left || 0.5) * fieldHeight);
    const rightPaddle = Math.floor((this.gameState.paddles?.right || 0.5) * fieldHeight);
    const ballX = Math.floor((this.gameState.ball?.x || 0.5) * fieldWidth);
    const ballY = Math.floor((this.gameState.ball?.y || 0.5) * fieldHeight);
    
    // Paddle height (approximate)
    const paddleHeight = 3;
    
    // Draw game field
    for (let y = 0; y < fieldHeight; y++) {
      let line = '';
      
      // Left paddle
      if (y >= leftPaddle - paddleHeight && y <= leftPaddle + paddleHeight) {
        line += '█';
      } else {
        line += '│';
      }
      
      // Field
      for (let x = 0; x < fieldWidth; x++) {
        if (x === ballX && y === ballY) {
          line += '●'; // Ball
        } else if (x === fieldWidth / 2) {
          line += '┊'; // Center line
        } else {
          line += ' ';
        }
      }
      
      // Right paddle
      if (y >= rightPaddle - paddleHeight && y <= rightPaddle + paddleHeight) {
        line += '█';
      } else {
        line += '│';
      }
      
      console.log(line);
    }
    
    console.log('='.repeat(60));
    console.log(`Role: ${this.playerRole === 'left' ? 'Left Player ◀️' : this.playerRole === 'right' ? 'Right Player ▶️' : 'Spectator 👁️'}`);
    console.log('Controls: [W] Up | [S] Down | [Q] Quit');
    console.log('='.repeat(60));
  }

  showGameControls() {
    console.log('\n🎮 GAME STARTED!');
    console.log('='.repeat(50));
    console.log('Controls:');
    console.log('  W - Move paddle up');
    console.log('  S - Move paddle down');
    console.log('  Q - Quit game');
    console.log('='.repeat(50));
    
    // Note: setupGameInput() is already called when connection is established
  }

  setupGameInput() {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    stdin.on('data', (key) => {
      if (key === 'q' || key === 'Q') {
        console.log('\nQuitting game...');
        if (this.wsConnection) {
          this.wsConnection.close();
        }
        stdin.setRawMode(false);
        stdin.pause();
        return;
      }
      
      if (this.wsConnection) {
        // Handle ready signal - works like pressing 'R' in browser
        if (key === 'r' || key === 'R') {
          console.log('✅ Sending READY signal...');
          this.wsConnection.send(JSON.stringify({
            type: 'status',
            status: 'READY'
          }));
          return;
        }
        
        // Handle paddle movement
        if (this.playerRole) {
          if (key === 'w' || key === 'W') {
            this.wsConnection.send(JSON.stringify({
              type: 'move',
              direction: 'UP'
            }));
          } else if (key === 's' || key === 'S') {
            this.wsConnection.send(JSON.stringify({
              type: 'move',
              direction: 'DOWN'
            }));
          }
        }
      }
    });
  }

  async waitForGameFinish() {
    return new Promise((resolve) => {
      const checkFinish = () => {
        if (!this.wsConnection) {
          // Reset stdin to normal mode
          try {
            const stdin = process.stdin;
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeAllListeners('data');
            // Give a moment for stdin to reset before resuming readline
            setTimeout(() => {
              stdin.resume();
              resolve();
            }, 100);
          } catch (error) {
            // Ignore errors during cleanup
            resolve();
          }
        } else {
          setTimeout(checkFinish, 1000);
        }
      };
      checkFinish();
    });
  }

  async leaveTournament() {
    if (!this.currentRoom) {
      console.log('❌ Not in any tournament');
      return;
    }
    
    try {
      const response = await this.makeRequest('POST', '/tournament/leave', {
        roomId: this.currentRoom,
        token: this.token,
        sessionId: this.sessionId
      });
      
      if (response.success) {
        console.log('✅ Left tournament successfully');
        this.currentRoom = null;
      } else {
        console.log(`❌ Failed to leave tournament: ${response.error}`);
      }
    } catch (error) {
      console.log(`❌ Error leaving tournament: ${error.message}`);
    }
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        rejectUnauthorized: false // For self-signed certificates
      };

      if (this.token) {
        options.headers['Authorization'] = `Bearer ${this.token}`;
      }

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (error) {
            resolve(body);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  extractTokenFromResponse(response) {
    // Try to extract token from various response formats
    if (response.token) return response.token;
    if (response.access_token) return response.access_token;
    return null;
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  generateSessionId() {
    return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  async establishWebSocketConnection() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Establishing WebSocket connection...');
      
      const wsUrl = 'wss://localhost:3000/invitations';
      this.invitationWs = new WebSocket(wsUrl);
      
      this.invitationWs.on('open', () => {
        console.log('✅ WebSocket connected');
        
        // Send authentication message
        this.invitationWs.send(JSON.stringify({
          type: 'auth',
          token: this.token,
          sessionId: this.sessionId
        }));
      });
      
      this.invitationWs.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          if (message.type === 'cookies') {
            console.log('✅ Authentication confirmed');
            resolve();
          }
        } catch (error) {
          console.log('Invalid WebSocket message format');
        }
      });
      
      this.invitationWs.on('error', (error) => {
        console.log(`❌ WebSocket error: ${error.message}`);
        reject(error);
      });
      
      this.invitationWs.on('close', () => {
        console.log('WebSocket connection closed');
        this.invitationWs = null;
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.invitationWs && this.invitationWs.readyState === WebSocket.CONNECTING) {
          console.log('❌ WebSocket connection timeout');
          this.invitationWs.close();
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  cleanup() {
    if (this.invitationWs) {
      this.invitationWs.close();
    }
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }
}

// Start the CLI
const cli = new TournamentCLI();
cli.start().catch(console.error);

