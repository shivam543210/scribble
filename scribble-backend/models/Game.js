/**
 * Game Model - Manages game state for drawing and guessing
 */
class Game {
  constructor() {
    // Map structure: roomId -> gameState
    this.games = new Map();
  }

  /**
   * Creates a new game for a room
   * @param {string} roomId - ID of the room
   * @param {Object} settings - { rounds: number, drawTime: number, words: Array }
   * @returns {Object} Game state
   */
  createGame(roomId, settings = {}) {
    const gameState = {
      roomId,
      rounds: settings.rounds || 3,
      currentRound: 0,
      drawTime: settings.drawTime || 60, // seconds
      isActive: false,
      isRoundActive: false,
      currentDrawer: null,
      currentWord: null,
      wordOptions: [],
      players: [], // Array of { id, username, score, hasGuessed }
      guessedPlayers: [],
      roundStartTime: null,
      timer: null,
      usedWords: [],
      settings: settings
    };

    this.games.set(roomId, gameState);
    return gameState;
  }

  /**
   * Gets game state for a room
   * @param {string} roomId - ID of the room
   * @returns {Object|null} Game state or null
   */
  getGame(roomId) {
    return this.games.get(roomId) || null;
  }

  /**
   * Adds player to game
   * @param {string} roomId - ID of the room
   * @param {Object} player - { id: string, username: string }
   * @returns {boolean} Success status
   */
  addPlayer(roomId, player) {
    const game = this.games.get(roomId);
    if (!game) return false;

    const existingPlayer = game.players.find(p => p.id === player.id);
    if (existingPlayer) return true;

    game.players.push({
      id: player.id,
      username: player.username,
      score: 0,
      hasGuessed: false
    });

    return true;
  }

  /**
   * Removes player from game
   * @param {string} roomId - ID of the room
   * @param {string} playerId - Socket ID of player
   * @returns {Object|null} Removed player or null
   */
  removePlayer(roomId, playerId) {
    const game = this.games.get(roomId);
    if (!game) return null;

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return null;

    const removedPlayer = game.players.splice(playerIndex, 1)[0];
    
    // If drawer left, end round
    if (game.currentDrawer === playerId && game.isRoundActive) {
      this.endRound(roomId);
    }

    return removedPlayer;
  }

  /**
   * Starts the game
   * @param {string} roomId - ID of the room
   * @returns {boolean} Success status
   */
  startGame(roomId) {
    const game = this.games.get(roomId);
    if (!game || game.isActive) return false;

    game.isActive = true;
    game.currentRound = 0;
    game.usedWords = [];
    
    // Reset all player scores
    game.players.forEach(player => {
      player.score = 0;
      player.hasGuessed = false;
    });

    return true;
  }

  /**
   * Starts a new round
   * @param {string} roomId - ID of the room
   * @returns {Object|null} Round data { drawer: Object, wordOptions: Array, round: number } or null
   */
  startRound(roomId) {
    const game = this.games.get(roomId);
    if (!game || !game.isActive) return null;

    game.currentRound++;
    
    if (game.currentRound > game.rounds) {
      this.endGame(roomId);
      return null;
    }

    // Select next drawer (round-robin)
    const drawerIndex = (game.currentRound - 1) % game.players.length;
    const drawer = game.players[drawerIndex];
    game.currentDrawer = drawer.id;

    // Generate word options (3 words)
    game.wordOptions = this.generateWordOptions(game.usedWords);
    game.currentWord = null;
    game.guessedPlayers = [];
    
    // Reset hasGuessed for all players
    game.players.forEach(player => {
      player.hasGuessed = false;
    });

    game.isRoundActive = false; // Will be true when drawer selects word

    return {
      drawer: drawer,
      wordOptions: game.wordOptions,
      round: game.currentRound,
      totalRounds: game.rounds
    };
  }

  /**
   * Drawer selects word to draw
   * @param {string} roomId - ID of the room
   * @param {string} word - Selected word
   * @returns {boolean} Success status
   */
  selectWord(roomId, word) {
    const game = this.games.get(roomId);
    if (!game || !game.wordOptions.includes(word)) return false;

    game.currentWord = word;
    game.usedWords.push(word);
    game.isRoundActive = true;
    game.roundStartTime = Date.now();

    return true;
  }

  /**
   * Processes a guess
   * @param {string} roomId - ID of the room
   * @param {string} playerId - Socket ID of guesser
   * @param {string} guess - The guess
   * @returns {Object} { correct: boolean, points: number, player: Object }
   */
  processGuess(roomId, playerId, guess) {
    const game = this.games.get(roomId);
    if (!game || !game.isRoundActive || !game.currentWord) {
      return { correct: false, points: 0, player: null };
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player || player.hasGuessed || playerId === game.currentDrawer) {
      return { correct: false, points: 0, player: null };
    }

    const isCorrect = guess.toLowerCase().trim() === game.currentWord.toLowerCase();

    if (isCorrect) {
      player.hasGuessed = true;
      game.guessedPlayers.push(playerId);

      // Calculate points based on guess order
      const guessOrder = game.guessedPlayers.length;
      let points = 0;
      
      if (guessOrder === 1) points = 100; // First guess
      else if (guessOrder === 2) points = 75;
      else if (guessOrder === 3) points = 50;
      else points = 25;

      // Add time bonus
      const timeElapsed = (Date.now() - game.roundStartTime) / 1000;
      const timeBonus = Math.max(0, Math.floor((game.drawTime - timeElapsed) / 2));
      points += timeBonus;

      player.score += points;

      // Give points to drawer
      const drawer = game.players.find(p => p.id === game.currentDrawer);
      if (drawer) {
        drawer.score += 25; // Drawer gets points when someone guesses
      }

      // Check if all players guessed
      const nonDrawerPlayers = game.players.filter(p => p.id !== game.currentDrawer);
      const allGuessed = nonDrawerPlayers.every(p => p.hasGuessed);

      return {
        correct: true,
        points: points,
        player: player,
        allGuessed: allGuessed,
        isFirst: guessOrder === 1,
        guessOrder: guessOrder
      };
    }

    return { correct: false, points: 0, player: null };
  }

  /**
   * Ends current round
   * @param {string} roomId - ID of the room
   * @returns {Object} { word: string, scores: Array }
   */
  endRound(roomId) {
    const game = this.games.get(roomId);
    if (!game) return null;

    const word = game.currentWord;
    game.isRoundActive = false;
    game.currentWord = null;
    game.wordOptions = [];

    return {
      word: word,
      scores: game.players.map(p => ({
        id: p.id,
        username: p.username,
        score: p.score
      }))
    };
  }

  /**
   * Ends the game
   * @param {string} roomId - ID of the room
   * @returns {Object} { winner: Object, scores: Array }
   */
  endGame(roomId) {
    const game = this.games.get(roomId);
    if (!game) return null;

    game.isActive = false;
    game.isRoundActive = false;

    // Find winner (highest score)
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return {
      winner: winner,
      scores: sortedPlayers.map(p => ({
        id: p.id,
        username: p.username,
        score: p.score
      }))
    };
  }

  /**
   * Gets masked word (for guessers)
   * @param {string} word - The actual word
   * @returns {string} Masked word (e.g., "apple" -> "_ _ _ _ _")
   */
  getMaskedWord(word) {
    if (!word) return '';
    return word.split('').map(() => '_').join(' ');
  }

  /**
   * Gets hint (reveals some letters)
   * @param {string} word - The actual word
   * @param {number} revealCount - Number of letters to reveal
   * @returns {string} Word with some letters revealed
   */
  getHint(word, revealCount = 1) {
    if (!word) return '';
    
    const indices = [];
    const wordArray = word.split('');
    
    // Randomly select indices to reveal
    while (indices.length < revealCount && indices.length < word.length) {
      const randomIndex = Math.floor(Math.random() * word.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }

    return wordArray.map((char, i) => 
      indices.includes(i) ? char : '_'
    ).join(' ');
  }

  /**
   * Generates word options for drawer
   * @param {Array} usedWords - Words already used
   * @returns {Array} Array of 3 words
   */
  generateWordOptions(usedWords = []) {
    const allWords = [
      // Easy words
      'apple', 'banana', 'cat', 'dog', 'house', 'tree', 'car', 'sun',
      'moon', 'star', 'flower', 'book', 'phone', 'chair', 'table', 'cup',
      // Medium words
      'elephant', 'guitar', 'mountain', 'rainbow', 'butterfly', 'umbrella',
      'camera', 'bicycle', 'pizza', 'rocket', 'castle', 'diamond',
      // Hard words
      'telescope', 'helicopter', 'saxophone', 'lighthouse', 'penguin',
      'kangaroo', 'watermelon', 'pineapple', 'dinosaur', 'computer',
      'football', 'basketball', 'baseball', 'tennis', 'swimming',
      'dragon', 'unicorn', 'mermaid', 'wizard', 'pirate',
      'crown', 'sword', 'shield', 'treasure', 'bridge'
    ];

    // Filter out used words
    const availableWords = allWords.filter(w => !usedWords.includes(w));
    
    // Shuffle and pick 3
    const shuffled = availableWords.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }



  /**
   * Deletes game
   * @param {string} roomId - ID of the room
   */
  deleteGame(roomId) {
    this.games.delete(roomId);
  }
}

module.exports = new Game();
