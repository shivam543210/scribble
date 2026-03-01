import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Canvas from './Canvas';
import UserList from './UserList';
import Chat from './Chat';
import GameControls from './GameControls';
import socketService from '../utils/socket';

/**
 * Room component - Main drawing interface (Quick Draw theme)
 */
const Room = ({ roomId, roomName, currentUser, users }) => {
  const [drawingData, setDrawingData] = useState([]);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isDrawer, setIsDrawer] = useState(false);
  const [gameState, setGameState] = useState({
    currentRound: 0,
    totalRounds: 3,
    timeLeft: 0,
    isRoundActive: false,
    maskedWord: '',
    selectedWord: '',
    currentDrawerId: null
  });

  // Game event overlay state
  const [gameEvent, setGameEvent] = useState(null);
  // Possible events: { type: 'game-started' | 'round-ended' | 'game-ended', data: {} }

  const navigate = useNavigate();

  useEffect(() => {
    const handleRoomJoined = (data) => {
      if (data.drawingData) {
        setDrawingData(data.drawingData);
      }
      if (data.gameState) {
        setIsGameActive(data.gameState.isActive);
        setIsDrawer(data.gameState.currentDrawer === currentUser.id);
      }
    };

    const handleGameStarted = (data) => {
      setIsGameActive(true);
      setGameEvent({
        type: 'game-started',
        data: { rounds: data.rounds, drawTime: data.drawTime }
      });
      // Auto-dismiss after 3s
      setTimeout(() => setGameEvent(null), 3000);
    };

    const handleGameEnded = (data) => {
      setIsGameActive(false);
      setIsDrawer(false);
      setGameState(prev => ({ ...prev, isRoundActive: false, maskedWord: '', selectedWord: '' }));
      setGameEvent({
        type: 'game-ended',
        data: { winner: data.winner, scores: data.scores }
      });
    };

    const handleRoundStartedDrawer = (data) => {
      setIsDrawer(data.drawer.id === currentUser.id);
      setGameState(prev => ({
        ...prev,
        currentRound: data.round,
        totalRounds: data.totalRounds,
        currentDrawerId: data.drawer.id,
        isRoundActive: false,
        maskedWord: '',
        selectedWord: ''
      }));
      setGameEvent(null); // clear previous event
    };

    const handleRoundStartedGuesser = (data) => {
      setIsDrawer(data.drawer.id === currentUser.id);
      setGameState(prev => ({
        ...prev,
        currentRound: data.round,
        totalRounds: data.totalRounds,
        currentDrawerId: data.drawer.id,
        isRoundActive: false,
        maskedWord: ''
      }));
      setGameEvent(null);
    };

    const handleWordSelected = (data) => {
      setGameState(prev => ({
        ...prev,
        isRoundActive: true,
        selectedWord: data.word || '',
        maskedWord: data.maskedWord || ''
      }));
    };

    const handleHintRevealed = (data) => {
      setGameState(prev => ({ ...prev, maskedWord: data.hint }));
    };

    const handleRoundEnded = (data) => {
      setGameState(prev => ({ ...prev, isRoundActive: false, maskedWord: '', selectedWord: '' }));
      setIsDrawer(false);
      setGameEvent({
        type: 'round-ended',
        data: { word: data.word, scores: data.scores }
      });
      // Auto-dismiss after 4s
      setTimeout(() => setGameEvent(null), 4000);
    };

    socketService.onRoomJoined(handleRoomJoined);
    socketService.socket.on('game-started', handleGameStarted);
    socketService.socket.on('game-ended', handleGameEnded);
    socketService.socket.on('round-started-drawer', handleRoundStartedDrawer);
    socketService.socket.on('round-started-guesser', handleRoundStartedGuesser);
    socketService.socket.on('word-selected', handleWordSelected);
    socketService.socket.on('hint-revealed', handleHintRevealed);
    socketService.socket.on('round-ended', handleRoundEnded);

    return () => {
      socketService.off('room-joined', handleRoomJoined);
      socketService.socket.off('game-started', handleGameStarted);
      socketService.socket.off('game-ended', handleGameEnded);
      socketService.socket.off('round-started-drawer', handleRoundStartedDrawer);
      socketService.socket.off('round-started-guesser', handleRoundStartedGuesser);
      socketService.socket.off('word-selected', handleWordSelected);
      socketService.socket.off('hint-revealed', handleHintRevealed);
      socketService.socket.off('round-ended', handleRoundEnded);
    };
  }, [currentUser]);

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave the room?')) {
      socketService.disconnect();
      navigate('/');
      window.location.reload();
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  const getWordDisplay = () => {
    if (!isGameActive || !gameState.isRoundActive) return '';
    if (isDrawer && gameState.selectedWord) return gameState.selectedWord;
    if (gameState.maskedWord) return gameState.maskedWord;
    return '';
  };

  /**
   * Renders the game event overlay (Quick Draw themed)
   */
  const renderGameEvent = () => {
    if (!gameEvent) return null;

    switch (gameEvent.type) {
      case 'game-started':
        return (
          <div className="game-event-overlay" onClick={() => setGameEvent(null)}>
            <div className="game-event-card" onClick={(e) => e.stopPropagation()}>
              <div className="event-emojis">🎨 ✏️ 🖌️</div>
              <div className="event-ribbon large">Let's Play!</div>
              <p className="event-subtitle">
                Get ready to draw and guess!<br/>
                {gameEvent.data.rounds} rounds • {gameEvent.data.drawTime}s per round
              </p>
              <button className="event-dismiss-btn" onClick={() => setGameEvent(null)}>
                Let's Go!
              </button>
            </div>
          </div>
        );

      case 'round-ended':
        return (
          <div className="game-event-overlay" onClick={() => setGameEvent(null)}>
            <div className="game-event-card" onClick={(e) => e.stopPropagation()}>
              <div className="event-ribbon">Round Over!</div>
              <p className="event-subtitle">The word was:</p>
              <div className="event-word">{gameEvent.data.word}</div>
              {gameEvent.data.scores && gameEvent.data.scores.length > 0 && (
                <div className="event-scores">
                  {gameEvent.data.scores.slice(0, 5).map((player, i) => (
                    <div key={player.id || i} className="event-score-item">
                      <span className="event-score-rank">#{i + 1}</span>
                      <span className="event-score-name">{player.username}</span>
                      <span className="event-score-points">{player.score || 0} pts</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="event-dismiss-btn" onClick={() => setGameEvent(null)}>
                Next Round →
              </button>
            </div>
          </div>
        );

      case 'game-ended':
        const winner = gameEvent.data.winner;
        const hasWinner = winner && winner.score > 0;
        return (
          <div className="game-event-overlay" onClick={() => setGameEvent(null)}>
            <div className="game-event-card" onClick={(e) => e.stopPropagation()}>
              <div className="event-emojis">🏆 🎉 🥇</div>
              <div className={`event-ribbon large ${hasWinner ? 'winner' : 'no-winner'}`}>
                {hasWinner ? 'Winner!' : 'No Winner!'}
              </div>
              {hasWinner ? (
                <>
                  <div className="event-winner-name">{winner.username}</div>
                  <p className="event-subtitle">{winner.score} points</p>
                </>
              ) : (
                <p className="event-subtitle">Better luck next time!</p>
              )}
              {gameEvent.data.scores && gameEvent.data.scores.length > 0 && (
                <div className="event-scores">
                  {gameEvent.data.scores.map((player, i) => (
                    <div key={player.id || i} className="event-score-item">
                      <span className="event-score-rank">#{i + 1}</span>
                      <span className="event-score-name">{player.username}</span>
                      <span className="event-score-points">{player.score || 0} pts</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="event-dismiss-btn" onClick={() => setGameEvent(null)}>
                Play Again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="room">
      <div className="room-content">
        <div className="main-area">
          {/* Left: Canvas Area */}
          <div className="canvas-area">
            {/* Canvas Header: Word hint + Round + Timer */}
            {isGameActive && gameState.isRoundActive && (
              <div className="canvas-header">
                <div className="canvas-header-left">
                  <span className="guess-prompt">
                    {isDrawer ? 'Draw this word!' : 'Guess the drawing'}
                  </span>
                  <span className="word-display">{getWordDisplay()}</span>
                </div>
                <div className="canvas-header-right">
                  <span className="round-label">Round {gameState.currentRound}</span>
                  <GameControls
                    roomId={roomId}
                    currentUser={currentUser}
                    users={users}
                    isTimerOnly={true}
                  />
                </div>
              </div>
            )}

            <Canvas
              roomId={roomId}
              currentUser={currentUser}
              initialDrawingData={drawingData}
              isDrawer={isDrawer}
              isGameActive={isGameActive}
            />
          </div>

          {/* Right: Game Panel */}
          <div className="game-panel">
            <div className="game-panel-title">Scribble</div>
            <div className="game-panel-room-code">
              Room code: <span onClick={copyRoomId} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{roomId}</span>
            </div>

            {/* Leaderboard Card */}
            <div className="game-panel-card">
              <UserList
                users={users}
                currentUser={currentUser}
                isGameActive={isGameActive}
                currentDrawerId={gameState.currentDrawerId}
              />
            </div>

            {/* Chat Card */}
            <div className="game-panel-card chat-card">
              <Chat
                roomId={roomId}
                currentUser={currentUser}
                isGameActive={isGameActive}
                users={users}
              />
            </div>

            {/* Game Controls — Start button (only if game not active) */}
            {!isGameActive && (
              <div className="game-panel-controls">
                <GameControls
                  roomId={roomId}
                  currentUser={currentUser}
                  users={users}
                />
              </div>
            )}

            <button onClick={handleLeaveRoom} className="leave-btn" style={{
              marginTop: '12px',
              padding: '10px',
              background: 'white',
              color: '#e74c3c',
              border: '2px solid #e74c3c',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              width: '100%',
              transition: 'all 0.15s'
            }}>
              Leave Room
            </button>
          </div>
        </div>
      </div>

      {/* Game Event Overlay — Quick Draw Themed */}
      {renderGameEvent()}
    </div>
  );
};

export default Room;
