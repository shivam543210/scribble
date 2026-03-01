import React, { useState, useEffect } from 'react';
import socketService from '../utils/socket';

/**
 * GameControls component - Manages game state and controls
 * Props: { 
 *   roomId: string,
 *   currentUser: { id: string, username: string },
 *   users: Array,
 *   isTimerOnly: boolean (if true, only shows the timer)
 * }
 */
const GameControls = ({ roomId, currentUser, users, isTimerOnly = false }) => {
  const [gameState, setGameState] = useState({
    isActive: false,
    isRoundActive: false,
    currentRound: 0,
    totalRounds: 3,
    currentDrawer: null,
    drawTime: 60
  });
  const [, setPlayers] = useState([]);
  const [, setIsDrawer] = useState(false);
  const [wordOptions, setWordOptions] = useState([]);
  const [, setSelectedWord] = useState('');
  const [, setMaskedWord] = useState('');
  const [showWordSelection, setShowWordSelection] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [settings, setSettings] = useState({
    rounds: 3,
    drawTime: 60
  });

  useEffect(() => {
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

    const handleWordSelected = (data) => {
      setGameState(prev => ({ ...prev, isRoundActive: true }));
      setShowWordSelection(false);
      setTimeLeft(gameState.drawTime);

      if (data.word) {
        setSelectedWord(data.word);
      } else {
        setMaskedWord(data.maskedWord);
      }
    };

    const handleCorrectGuess = (data) => {
      console.log(`${data.player.username} guessed correctly! +${data.points} points`);
    };

    const handleHintRevealed = (data) => {
      setMaskedWord(data.hint);
    };

    const handleRoundEnded = (data) => {
      setGameState(prev => ({ ...prev, isRoundActive: false }));
      setSelectedWord('');
      setMaskedWord('');
      setIsDrawer(false);
      setPlayers(data.scores);
    };

    const handleGameEnded = (data) => {
      setGameState(prev => ({ ...prev, isActive: false, isRoundActive: false }));
      setPlayers(data.scores);
    };

    socketService.socket.on('game-started', handleGameStarted);
    socketService.socket.on('round-started-drawer', handleRoundStartedDrawer);
    socketService.socket.on('round-started-guesser', handleRoundStartedGuesser);
    socketService.socket.on('word-selected', handleWordSelected);
    socketService.socket.on('correct-guess', handleCorrectGuess);
    socketService.socket.on('hint-revealed', handleHintRevealed);
    socketService.socket.on('round-ended', handleRoundEnded);
    socketService.socket.on('game-ended', handleGameEnded);

    return () => {
      socketService.socket.off('game-started', handleGameStarted);
      socketService.socket.off('round-started-drawer', handleRoundStartedDrawer);
      socketService.socket.off('round-started-guesser', handleRoundStartedGuesser);
      socketService.socket.off('word-selected', handleWordSelected);
      socketService.socket.off('correct-guess', handleCorrectGuess);
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

  // Timer-only mode (for canvas header)
  if (isTimerOnly) {
    if (gameState.isRoundActive && timeLeft > 0) {
      return (
        <div className="timer">
          ⏰ {timeLeft}
        </div>
      );
    }
    return null;
  }

  // If game not active — show start button
  if (!gameState.isActive) {
    return (
      <div className="game-controls">
        <button onClick={() => setShowSettingsModal(true)} className="start-game-btn">
          ⚙️ Start Game
        </button>

        {showSettingsModal && (
          <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Game Settings</h3>
                <button className="modal-close" onClick={() => setShowSettingsModal(false)}>×</button>
              </div>
              <div className="modal-body">
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
              </div>
              <div className="modal-footer">
                <button onClick={handleStartGame} className="modal-start-btn">
                  Start Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active game — show word selection overlay only
  return (
    <>
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
    </>
  );

  /**
   * Starts the game
   */
  function handleStartGame() {
    if (users.length < 2) {
      alert('Need at least 2 players to start the game!');
      return;
    }
    socketService.socket.emit('start-game', { roomId, settings });
  }

  /**
   * Drawer selects a word
   */
  function handleSelectWord(word) {
    socketService.socket.emit('select-word', { roomId, word });
  }
};

export default GameControls;
