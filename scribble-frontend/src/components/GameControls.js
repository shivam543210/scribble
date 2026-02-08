import React, { useState, useEffect } from 'react';
import socketService from '../utils/socket';

/**
 * GameControls component - Manages game state and controls
 * Props: { 
 *   roomId: string,
 *   currentUser: { id: string, username: string },
 *   users: Array
 * }
 */
const GameControls = ({ roomId, currentUser, users }) => {
  const [gameState, setGameState] = useState({
    isActive: false,
    isRoundActive: false,
    currentRound: 0,
    totalRounds: 3,
    currentDrawer: null,
    drawTime: 60
  });
  const [players, setPlayers] = useState([]);
  const [isDrawer, setIsDrawer] = useState(false);
  const [wordOptions, setWordOptions] = useState([]);
  const [selectedWord, setSelectedWord] = useState('');
  const [maskedWord, setMaskedWord] = useState('');
  const [showWordSelection, setShowWordSelection] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [settings, setSettings] = useState({
    rounds: 3,
    drawTime: 60
  });

  useEffect(() => {
    // Listen for game started
    // Receives: { rounds: number, drawTime: number }
    const handleGameStarted = (data) => {
      setGameState(prev => ({
        ...prev,
        isActive: true,
        totalRounds: data.rounds,
        drawTime: data.drawTime,
        currentRound: 0
      }));
      setSettings({ rounds: data.rounds, drawTime: data.drawTime });
    };

    // Listen for round started (drawer)
    // Receives: { drawer: Object, wordOptions: Array, round: number, totalRounds: number }
    const handleRoundStartedDrawer = (data) => {
      setGameState(prev => ({
        ...prev,
        currentRound: data.round,
        totalRounds: data.totalRounds,
        currentDrawer: data.drawer.id
      }));
      setIsDrawer(data.drawer.id === currentUser.id);
      
      if (data.drawer.id === currentUser.id) {
        setWordOptions(data.wordOptions);
        setShowWordSelection(true);
      }
    };

    // Listen for round started (guesser)
    // Receives: { drawer: Object, round: number, totalRounds: number }
    const handleRoundStartedGuesser = (data) => {
      setGameState(prev => ({
        ...prev,
        currentRound: data.round,
        totalRounds: data.totalRounds,
        currentDrawer: data.drawer.id,
        isRoundActive: false
      }));
      setIsDrawer(false);
      setMaskedWord('');
    };

    // Listen for word selected
    // Receives: { word: string } for drawer, { maskedWord: string, wordLength: number } for guessers
    const handleWordSelected = (data) => {
      setGameState(prev => ({ ...prev, isRoundActive: true }));
      setShowWordSelection(false);
      setTimeLeft(gameState.drawTime);

      if (data.word) {
        // Drawer
        setSelectedWord(data.word);
      } else {
        // Guesser
        setMaskedWord(data.maskedWord);
      }
    };

    // Listen for correct guess
    // Receives: { player: Object, points: number, word: string|null }
    const handleCorrectGuess = (data) => {
      // Update UI to show someone guessed correctly
      console.log(`${data.player.username} guessed correctly! +${data.points} points`);
    };

    // Listen for leaderboard update
    // Receives: { leaderboard: Array<{ id: string, username: string, score: number }> }
    const handleLeaderboardUpdate = (data) => {
      setPlayers(data.leaderboard);
    };

    // Listen for hint revealed
    // Receives: { hint: string }
    const handleHintRevealed = (data) => {
      setMaskedWord(data.hint);
    };

    // Listen for round ended
    // Receives: { word: string, scores: Array }
    const handleRoundEnded = (data) => {
      setGameState(prev => ({ ...prev, isRoundActive: false }));
      setSelectedWord('');
      setMaskedWord('');
      setIsDrawer(false);
      setPlayers(data.scores);
      alert(`Round ended! The word was: ${data.word}`);
    };

    // Listen for game ended
    // Receives: { winner: Object, scores: Array }
    const handleGameEnded = (data) => {
      setGameState(prev => ({ ...prev, isActive: false, isRoundActive: false }));
      setPlayers(data.scores);
      alert(`Game Over! Winner: ${data.winner.username} with ${data.winner.score} points!`);
    };

    socketService.socket.on('game-started', handleGameStarted);
    socketService.socket.on('round-started-drawer', handleRoundStartedDrawer);
    socketService.socket.on('round-started-guesser', handleRoundStartedGuesser);
    socketService.socket.on('word-selected', handleWordSelected);
    socketService.socket.on('correct-guess', handleCorrectGuess);
    socketService.socket.on('leaderboard-update', handleLeaderboardUpdate);
    socketService.socket.on('hint-revealed', handleHintRevealed);
    socketService.socket.on('round-ended', handleRoundEnded);
    socketService.socket.on('game-ended', handleGameEnded);

    return () => {
      socketService.socket.off('game-started', handleGameStarted);
      socketService.socket.off('round-started-drawer', handleRoundStartedDrawer);
      socketService.socket.off('round-started-guesser', handleRoundStartedGuesser);
      socketService.socket.off('word-selected', handleWordSelected);
      socketService.socket.off('correct-guess', handleCorrectGuess);
      socketService.socket.off('leaderboard-update', handleLeaderboardUpdate);
      socketService.socket.off('hint-revealed', handleHintRevealed);
      socketService.socket.off('round-ended', handleRoundEnded);
      socketService.socket.off('game-ended', handleGameEnded);
    };
  }, [currentUser, gameState.drawTime]);

  // Timer countdown
  useEffect(() => {
    if (gameState.isRoundActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.isRoundActive, timeLeft]);

  /**
   * Starts the game
   * Emits: 'start-game' with { roomId: string, settings: Object }
   */
  const handleStartGame = () => {
    if (users.length < 2) {
      alert('Need at least 2 players to start the game!');
      return;
    }
    // Emits to server: { roomId: string, settings: { rounds: number, drawTime: number } }
    socketService.socket.emit('start-game', { roomId, settings });
  };

  /**
   * Drawer selects a word
   * Emits: 'select-word' with { roomId: string, word: string }
   * @param {string} word - Selected word
   */
  const handleSelectWord = (word) => {
    // Emits to server: { roomId: string, word: string }
    socketService.socket.emit('select-word', { roomId, word });
  };

  /**
   * Requests a hint
   * Emits: 'request-hint' with { roomId: string }
   */
  const handleRequestHint = () => {
    // Emits to server: { roomId: string }
    socketService.socket.emit('request-hint', { roomId });
  };

  if (!gameState.isActive) {
    return (
      <div className="game-controls">
        <div className="game-setup">
          <h3>Game Settings</h3>
          <div className="setting-group">
            <label>
              Number of Rounds:
              <input
                type="number"
                min="1"
                max="10"
                value={settings.rounds}
                onChange={(e) => setSettings({ ...settings, rounds: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="setting-group">
            <label>
              Draw Time (seconds):
              <input
                type="number"
                min="30"
                max="180"
                step="10"
                value={settings.drawTime}
                onChange={(e) => setSettings({ ...settings, drawTime: Number(e.target.value) })}
              />
            </label>
          </div>
          <button onClick={handleStartGame} className="start-game-btn">
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-controls active">
      <div className="game-header">
        <div className="round-info">
          Round {gameState.currentRound} / {gameState.totalRounds}
        </div>
        {gameState.isRoundActive && (
          <div className="timer">
            ⏱️ {timeLeft}s
          </div>
        )}
      </div>

      {isDrawer && gameState.isRoundActive && (
        <div className="drawer-info">
          <h3>Your word: <span className="current-word">{selectedWord}</span></h3>
          <p className="drawer-hint">Draw this word! Don't write it or use letters/numbers!</p>
        </div>
      )}

      {!isDrawer && gameState.isRoundActive && (
        <div className="guesser-info">
          <h3>Guess the word!</h3>
          <div className="word-hint">{maskedWord}</div>
          <button onClick={handleRequestHint} className="hint-btn">
            Get Hint
          </button>
        </div>
      )}

      {showWordSelection && (
        <div className="word-selection-overlay">
          <div className="word-selection-modal">
            <h2>Choose a word to draw!</h2>
            <div className="word-options">
              {wordOptions.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectWord(word)}
                  className="word-option"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {players.length > 0 && (
        <div className="leaderboard-mini">
          <h4>Scores</h4>
          {players.map((player, index) => (
            <div key={player.id} className="player-score">
              <span className="rank">#{index + 1}</span>
              <span className="player-name">{player.username}</span>
              <span className="score">{player.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameControls;
