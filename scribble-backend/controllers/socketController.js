const Room = require('../models/Room');
const Game = require('../models/Game');

class SocketController {
  /**
   * Initializes socket connection and sets up event listeners
   * @param {Socket} socket - Socket.IO socket instance with properties: { id: string, rooms: Set, handshake: Object }
   */
  handleConnection(socket) {
    console.log(`User connected: ${socket.id}`);

    // Room events
    // Event: User creates a new room
    // Expects: { roomName: string, username: string }
    socket.on('create-room', (data) => {
      this.handleCreateRoom(socket, data);
    });

    // Event: User joins an existing room
    // Expects: { roomId: string, username: string }
    socket.on('join-room', (data) => {
      this.handleJoinRoom(socket, data);
    });

    // Drawing events
    // Event: User draws on canvas
    // Expects: { roomId: string, drawingData: { type: 'draw'|'erase', points: Array, color: string, lineWidth: number } }
    socket.on('drawing', (data) => {
      this.handleDrawing(socket, data);
    });

    // Event: User clears the canvas
    // Expects: { roomId: string }
    socket.on('clear-canvas', (data) => {
      this.handleClearCanvas(socket, data);
    });

    // Chat events
    // Event: User sends a chat message or guess
    // Expects: { roomId: string, message: string }
    socket.on('chat-message', (data) => {
      this.handleChatMessage(socket, data);
    });

    // Game events
    // Event: Start game
    // Expects: { roomId: string, settings: { rounds: number, drawTime: number } }
    socket.on('start-game', (data) => {
      this.handleStartGame(socket, data);
    });

    // Event: Start new round
    // Expects: { roomId: string }
    socket.on('start-round', (data) => {
      this.handleStartRound(socket, data);
    });

    // Event: Drawer selects word
    // Expects: { roomId: string, word: string }
    socket.on('select-word', (data) => {
      this.handleSelectWord(socket, data);
    });

    // Event: Request hint
    // Expects: { roomId: string }
    socket.on('request-hint', (data) => {
      this.handleRequestHint(socket, data);
    });

    // Event: End current round
    // Expects: { roomId: string }
    socket.on('end-round', (data) => {
      this.handleEndRound(socket, data);
    });

    // Event: User disconnects
    // Expects: No data
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  /**
   * Handles room creation
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomName: string, username: string }
   */
  handleCreateRoom(socket, data) {
    const { roomName, username } = data;

    if (!roomName || !username) {
      // Emits to: The requesting socket only
      // Sends: { error: string }
      socket.emit('error', { error: 'Room name and username are required' });
      return;
    }

    const room = Room.createRoom(roomName);
    const user = {
      id: socket.id,
      username,
      color: this.generateRandomColor()
    };
    Room.addUser(room.id, user);
    socket.join(room.id);

    // Create game for this room
    Game.createGame(room.id);
    Game.addPlayer(room.id, user);

    // Emits to: The requesting socket only
    // Sends: { roomId: string, roomName: string, user: { id: string, username: string, color: string } }
    socket.emit('room-created', {
      roomId: room.id,
      roomName: room.name,
      user
    });

    console.log(`Room created: ${room.id} by ${username}`);
  }

  /**
   * Handles user joining a room
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string, username: string }
   */
  handleJoinRoom(socket, data) {
    const { roomId, username } = data;

    if (!roomId || !username) {
      // Emits to: The requesting socket only
      // Sends: { error: string }
      socket.emit('error', { error: 'Room ID and username are required' });
      return;
    }

    const room = Room.getRoom(roomId);
    if (!room) {
      // Emits to: The requesting socket only
      // Sends: { error: string }
      socket.emit('error', { error: 'Room not found' });
      return;
    }

    const user = {
      id: socket.id,
      username,
      color: this.generateRandomColor()
    };
    Room.addUser(roomId, user);
    socket.join(roomId);

    // Add player to game
    let game = Game.getGame(roomId);
    if (!game) {
      game = Game.createGame(roomId);
    }
    Game.addPlayer(roomId, user);

    const drawingData = Room.getDrawingData(roomId);

    // Emits to: The requesting socket only
    // Sends: { roomId: string, roomName: string, user: Object, users: Array, drawingData: Array, gameState: Object }
    socket.emit('room-joined', {
      roomId: room.id,
      roomName: room.name,
      user,
      users: room.users,
      drawingData,
      gameState: {
        isActive: game.isActive,
        isRoundActive: game.isRoundActive,
        currentRound: game.currentRound,
        totalRounds: game.rounds,
        currentDrawer: game.currentDrawer,
        players: game.players
      }
    });

    // Emits to: All other sockets in the room
    // Sends: { user: { id: string, username: string, color: string } }
    socket.to(roomId).emit('user-joined', { user });

    console.log(`${username} joined room: ${roomId}`);
  }

  /**
   * Handles drawing events
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string, drawingData: { type: string, points: Array, color: string, lineWidth: number } }
   */
  handleDrawing(socket, data) {
    const { roomId, drawingData } = data;

    if (!roomId || !drawingData) return;

    const room = Room.getRoom(roomId);
    if (!room) return;

    // Check if user is current drawer in game mode
    const game = Game.getGame(roomId);
    if (game && game.isRoundActive && game.currentDrawer !== socket.id) {
      // Only drawer can draw during game
      return;
    }

    const drawingEvent = {
      type: drawingData.type,
      data: drawingData,
      userId: socket.id,
      timestamp: Date.now()
    };
    Room.addDrawingData(roomId, drawingEvent);

    // Emits to: All other sockets in the room
    // Sends: { drawingData: { type: string, points: Array, color: string, lineWidth: number }, userId: string }
    socket.to(roomId).emit('drawing', {
      drawingData,
      userId: socket.id
    });
  }

  /**
   * Handles canvas clearing
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string }
   */
  handleClearCanvas(socket, data) {
    const { roomId } = data;

    if (!roomId) return;

    const room = Room.getRoom(roomId);
    if (!room) return;

    Room.clearDrawingData(roomId);

    // Emits to: All sockets in the room
    // Sends: No data
    socket.to(roomId).emit('canvas-cleared');
    socket.emit('canvas-cleared');

    console.log(`Canvas cleared in room: ${roomId}`);
  }

  /**
   * Handles chat messages and guesses
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string, message: string }
   */
  handleChatMessage(socket, data) {
    const { roomId, message } = data;

    if (!roomId || !message) return;

    const user = this.getUserFromSocket(socket, roomId);
    if (!user) return;

    const game = Game.getGame(roomId);

    // Check if it's a guess in active game
    if (game && game.isRoundActive && socket.id !== game.currentDrawer) {
      const guessResult = Game.processGuess(roomId, socket.id, message);

      if (guessResult.correct) {
        // Emits to: All sockets in the room
        // Sends: { player: Object, points: number, word: string }
        socket.to(roomId).emit('correct-guess', {
          player: guessResult.player,
          points: guessResult.points,
          word: null // Don't reveal word yet
        });

        socket.emit('correct-guess', {
          player: guessResult.player,
          points: guessResult.points,
          word: game.currentWord
        });

        // Update leaderboard
        const leaderboard = Game.getLeaderboard(roomId);
        // Emits to: All sockets in the room
        // Sends: { leaderboard: Array }
        socket.to(roomId).emit('leaderboard-update', { leaderboard });
        socket.emit('leaderboard-update', { leaderboard });

        // If all guessed, end round
        if (guessResult.allGuessed) {
          setTimeout(() => {
            this.handleEndRound(socket, { roomId });
          }, 2000);
        }

        return;
      }
    }

    // Regular chat message
    // Emits to: All sockets in the room
    // Sends: { user: { id: string, username: string, color: string }, message: string, timestamp: number, isGuess: boolean }
    const messageData = {
      user,
      message,
      timestamp: Date.now(),
      isGuess: game && game.isRoundActive && socket.id !== game.currentDrawer
    };

    socket.to(roomId).emit('chat-message', messageData);
    socket.emit('chat-message', messageData);
  }

  /**
   * Handles game start
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string, settings: { rounds: number, drawTime: number } }
   */
  handleStartGame(socket, data) {
    const { roomId, settings } = data;

    if (!roomId) return;

    let game = Game.getGame(roomId);
    if (!game) {
      game = Game.createGame(roomId, settings);
    }

    const started = Game.startGame(roomId);
    if (!started) return;

    // Clear canvas
    Room.clearDrawingData(roomId);
    socket.to(roomId).emit('canvas-cleared');
    socket.emit('canvas-cleared');

    // Emits to: All sockets in the room
    // Sends: { rounds: number, drawTime: number }
    socket.to(roomId).emit('game-started', {
      rounds: game.rounds,
      drawTime: game.drawTime
    });
    socket.emit('game-started', {
      rounds: game.rounds,
      drawTime: game.drawTime
    });

    // Start first round after 3 seconds
    setTimeout(() => {
      this.handleStartRound(socket, { roomId });
    }, 3000);

    console.log(`Game started in room: ${roomId}`);
  }

  /**
   * Handles round start
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string }
   */
  handleStartRound(socket, data) {
    const { roomId } = data;

    if (!roomId) return;

    const game = Game.getGame(roomId);
    if (!game) return;

    const roundData = Game.startRound(roomId);
    if (!roundData) return;

    // Clear canvas for new round
    Room.clearDrawingData(roomId);
    socket.to(roomId).emit('canvas-cleared');
    socket.emit('canvas-cleared');

    // Emits to: Drawer only
    // Sends: { drawer: Object, wordOptions: Array, round: number, totalRounds: number }
    socket.to(roundData.drawer.id).emit('round-started-drawer', {
      drawer: roundData.drawer,
      wordOptions: roundData.wordOptions,
      round: roundData.round,
      totalRounds: roundData.totalRounds
    });

    if (socket.id === roundData.drawer.id) {
      socket.emit('round-started-drawer', {
        drawer: roundData.drawer,
        wordOptions: roundData.wordOptions,
        round: roundData.round,
        totalRounds: roundData.totalRounds
      });
    }

    // Emits to: Guessers only
    // Sends: { drawer: Object, round: number, totalRounds: number }
    const guessersData = {
      drawer: roundData.drawer,
      round: roundData.round,
      totalRounds: roundData.totalRounds
    };

    socket.to(roomId).emit('round-started-guesser', guessersData);
    if (socket.id !== roundData.drawer.id) {
      socket.emit('round-started-guesser', guessersData);
    }

    console.log(`Round ${roundData.round} started in room: ${roomId}`);
  }

  /**
   * Handles word selection by drawer
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string, word: string }
   */
  handleSelectWord(socket, data) {
    const { roomId, word } = data;

    if (!roomId || !word) return;

    const game = Game.getGame(roomId);
    if (!game || socket.id !== game.currentDrawer) return;

    const selected = Game.selectWord(roomId, word);
    if (!selected) return;

    const maskedWord = Game.getMaskedWord(word);

    // Emits to: Drawer only
    // Sends: { word: string }
    socket.emit('word-selected', { word: word });

    // Emits to: Guessers only
    // Sends: { maskedWord: string, wordLength: number }
    socket.to(roomId).emit('word-selected', {
      maskedWord: maskedWord,
      wordLength: word.length
    });

    // Start round timer
    const drawTime = game.drawTime;
    setTimeout(() => {
      const currentGame = Game.getGame(roomId);
      if (currentGame && currentGame.isRoundActive) {
        this.handleEndRound(socket, { roomId });
      }
    }, drawTime * 1000);

    console.log(`Word selected in room: ${roomId}`);
  }

  /**
   * Handles hint request
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string }
   */
  handleRequestHint(socket, data) {
    const { roomId } = data;

    if (!roomId) return;

    const game = Game.getGame(roomId);
    if (!game || !game.isRoundActive || !game.currentWord) return;

    const hint = Game.getHint(game.currentWord, 1);

    // Emits to: All guessers (not drawer)
    // Sends: { hint: string }
    socket.to(roomId).emit('hint-revealed', { hint });
    if (socket.id !== game.currentDrawer) {
      socket.emit('hint-revealed', { hint });
    }
  }

  /**
   * Handles round end
   * @param {Socket} socket - Socket instance
   * @param {Object} data - { roomId: string }
   */
  handleEndRound(socket, data) {
    const { roomId } = data;

    if (!roomId) return;

    const game = Game.getGame(roomId);
    if (!game) return;

    const roundResult = Game.endRound(roomId);
    if (!roundResult) return;

    // Emits to: All sockets in the room
    // Sends: { word: string, scores: Array }
    socket.to(roomId).emit('round-ended', roundResult);
    socket.emit('round-ended', roundResult);

    // Check if game is over
    if (game.currentRound >= game.rounds) {
      setTimeout(() => {
        const gameResult = Game.endGame(roomId);
        
        // Emits to: All sockets in the room
        // Sends: { winner: Object, scores: Array }
        socket.to(roomId).emit('game-ended', gameResult);
        socket.emit('game-ended', gameResult);

        console.log(`Game ended in room: ${roomId}`);
      }, 5000);
    } else {
      // Start next round after 5 seconds
      setTimeout(() => {
        this.handleStartRound(socket, { roomId });
      }, 5000);
    }

    console.log(`Round ended in room: ${roomId}`);
  }

  /**
   * Handles user disconnection
   * @param {Socket} socket - Socket instance
   */
  handleDisconnect(socket) {
    console.log(`User disconnected: ${socket.id}`);

    const rooms = Room.getAllRooms();
    rooms.forEach(room => {
      const user = Room.getUser(room.id, socket.id);
      if (user) {
        Room.removeUser(room.id, socket.id);
        Game.removePlayer(room.id, socket.id);
        
        // Emits to: All sockets in the room
        // Sends: { user: { id: string, username: string, color: string } }
        socket.to(room.id).emit('user-left', { user });
        
        console.log(`${user.username} left room: ${room.id}`);
      }
    });
  }

  /**
   * Helper: Gets user from socket and room
   * @param {Socket} socket - Socket instance
   * @param {string} roomId - Room ID
   * @returns {Object|null} User object or null
   */
  getUserFromSocket(socket, roomId) {
    return Room.getUser(roomId, socket.id);
  }

  /**
   * Helper: Generates random color for user
   * @returns {string} Hex color code
   */
  generateRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      '#F8B739', '#52B788', '#E63946', '#457B9D'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

module.exports = new SocketController();
