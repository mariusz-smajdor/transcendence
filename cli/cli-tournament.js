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
    this.readySent = false; // Track if READY signal was sent
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
    console.log('Welcome to Tournament CLI!');
    await this.showMainMenu();
  }

  async showMainMenu() {
    console.log('\n=== MAIN MENU ===');
    console.log('1. Enter your nickname');
    console.log('2. List Tournaments');
    console.log('3. Join Tournament');
    console.log('4. Exit');
    
    const choice = await this.askQuestion('Choose an option (1-4): ');
    
    switch(choice.trim()) {
      case '1':
        await this.playAnonymously();
        break;
      case '2':
        await this.listTournaments();
        break;
      case '3':
        await this.joinTournament();
        break;
      case '4':
        console.log('Goodbye!');
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
      console.log('Display name cannot be empty');
      await this.showMainMenu();
      return;
    }
    
    this.username = username.trim();
    this.isAnonymous = true;
    this.token = null; // No token for anonymous play
    
    console.log(`Playing as user: ${this.username}`);
    console.log(`Session ID: ${this.sessionId}`);
    
    // Establish WebSocket connection for tournaments
    try {
      await this.establishWebSocketConnection();
    } catch (error) {
      console.log(`Failed to establish WebSocket connection: ${error.message}`);
      console.log('You can still try to use tournament features, but they may not work properly.');
    }
    
    await this.showMainMenu();
  }

  async listTournaments() {
    if (!this.username) {
      console.log('Please enter your nickname first');
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
            const status = tournament.found ? 'You are in this tournament' : 'Available to join';
            console.log(`${index + 1}. ${tournament.creator}'s Tournament`);
            console.log(`   ${status}`);
            console.log(`   Players: ${tournament.playersIn}/${tournament.playersExpected}`);
            console.log(`   Room ID: ${tournament.id}`);
            console.log('');
          });
        }
      } else if (response.found) {
        console.log('You are currently in a tournament:');
        console.log(`   Creator: ${response.creator}`);
        console.log(`   Players: ${response.playersIn}/${response.playersExpected}`);
        console.log(`   Room ID: ${response.id}`);
        if (response.matches) {
          console.log('   Tournament Status: In Progress');
        }
      }
      
      await this.showMainMenu();
    } catch (error) {
      console.log(`Error fetching tournaments: ${error.message}`);
      await this.showMainMenu();
    }
  }

  async joinTournament() {
    if (!this.username) {
      console.log('Please play anonymously first');
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
        console.log(`Joined tournament successfully!`);
        console.log(`   Room ID: ${response.id}`);
        console.log(`   Players: ${response.playersIn}/${response.playersExpected}`);
        console.log('\nWaiting for tournament to start...');
        await this.waitForTournamentStart();
      } else {
        console.log(`Failed to join tournament`);
        await this.showMainMenu();
      }
    } catch (error) {
      console.log(`Error joining tournament: ${error.message}`);
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
    console.log('\nChecking for available match...');
    const gameId = await this.getPlayerMatch();
    
    if (gameId) {
      console.log(`Match found! Game ID: ${gameId}`);
      await this.playMatch(gameId);
    } else {
      console.log('No match available yet.');
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
          console.log(`  Status: Tournament Started!`);
          console.log(`  Matches: ${response.matches.length}`);
          
          // Check if player has a match to play
          const gameId = await this.getPlayerMatch();
          if (gameId) {
            console.log(`\nYou have a match to play! Game ID: ${gameId}`);
            console.log(`   Type "ready" to start your match`);
          }
        } else {
          console.log(`  Status: Waiting for players...`);
        }
      }
    } catch (error) {
      console.log(`Error checking status: ${error.message}`);
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
    
    // Reset ready state for new match
    this.readySent = false;
    
    const wsUrl = `wss://localhost:3000/tournament/match?gameId=${gameId}&roomId=${this.currentRoom}`;
    
    try {
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.on('open', () => {
        console.log('Connected to game!');
        console.log('Game controls are now active');
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
        console.log('\nGame connection closed');
        this.wsConnection = null;
      });
      
      this.wsConnection.on('error', (error) => {
        console.log(`WebSocket error: ${error.message}`);
      });
      
      // Wait for game to finish
      await this.waitForGameFinish();
      
      console.log('\nMatch completed! Returning to tournament lobby...');
      
    } catch (error) {
      console.log(`Error connecting to game: ${error.message}`);
    }
  }

  handleGameMessage(message) {
    // Handle object messages
    if (typeof message === 'object') {
      // Server sends 'gameState' (not 'game_state')
      if (message.type === 'gameState' && message.data) {
        this.gameState = message.data;
        return;
      }
      
      // Server sends 'role' (not 'player_assignment')
      if (message.type === 'role') {
        this.playerRole = message.role;
        console.log(`You are playing as: ${this.playerRole === 'left' ? 'Left Player' : this.playerRole === 'right' ? 'Right Player' : 'Spectator'}`);
        return;
      }
      
      // Handle broadcast messages (type: 'message')
      if (message.type === 'message' && message.message) {
        const msg = message.message;
        
        if (msg.includes('waiting_for_readiness')) {
          console.log('Waiting for players to be ready...');
          console.log('Press R to signal you are READY!');
        } else if (msg.includes('waiting_for_second_player')) {
          console.log('Waiting for second player to join...');
        } else if (msg.includes('left_player_ready')) {
          console.log('Left player is ready');
          if (this.playerRole === 'right') {
            console.log('Press R to signal you are READY!');
          }
        } else if (msg.includes('right_player_ready')) {
          console.log('Right player is ready');
          if (this.playerRole === 'left') {
            console.log('Press R to signal you are READY!');
          }
        } else if (msg.includes('count_to_start')) {
          console.log('\nGame starting in 3...\n');
        } else if (msg.includes('game_on')) {
          console.log('\n\n' + '='.repeat(60));
          console.log('                      MATCH STARTED!');
          console.log('='.repeat(60));
          console.log('         Controls: W - up | S - down | Q - quit');
          console.log('='.repeat(60) + '\n');
          this.readySent = false; // Reset for potential next match
        } else if (msg.includes('match_finished')) {
          console.log('Match finished!');
          this.wsConnection.close();
        } else if (msg.includes('The winner is:')) {
          console.log(`${msg}`);
        }
        return;
      }
    }
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
        // Handle ready signal
        if (key === 'r' || key === 'R') {
          if (this.readySent) {
            console.log('READY signal already sent. Waiting for other player...');
            return;
          }
          console.log('You are READY! Waiting for other player...');
          this.readySent = true;
          this.wsConnection.send(JSON.stringify({
            type: 'status',
            status: 'READY'
          }));
          return;
        }
        
        // Handle paddle movement
        if (this.playerRole && this.playerRole !== 'spectator') {
          if (key === 'w' || key === 'W') {
            console.log('up');
            this.wsConnection.send(JSON.stringify({
              type: 'move',
              direction: 'UP'
            }));
          } else if (key === 's' || key === 'S') {
            console.log('down');
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
      console.log('Not in any tournament');
      return;
    }
    
    try {
      const response = await this.makeRequest('POST', '/tournament/leave', {
        roomId: this.currentRoom,
        token: this.token,
        sessionId: this.sessionId
      });
      
      if (response.success) {
        console.log('Left tournament successfully');
        this.currentRoom = null;
      } else {
        console.log(`Failed to leave tournament: ${response.error}`);
      }
    } catch (error) {
      console.log(`Error leaving tournament: ${error.message}`);
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
      console.log('Establishing WebSocket connection...');
      
      const wsUrl = 'wss://localhost:3000/invitations';
      this.invitationWs = new WebSocket(wsUrl);
      
      this.invitationWs.on('open', () => {
        console.log('WebSocket connected');
        
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
            console.log('Authentication confirmed');
            resolve();
          }
        } catch (error) {
          console.log('Invalid WebSocket message format');
        }
      });
      
      this.invitationWs.on('error', (error) => {
        console.log(`WebSocket error: ${error.message}`);
        reject(error);
      });
      
      this.invitationWs.on('close', () => {
        console.log('WebSocket connection closed');
        this.invitationWs = null;
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.invitationWs && this.invitationWs.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout');
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

