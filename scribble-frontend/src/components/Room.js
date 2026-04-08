import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Canvas from './Canvas';
import UserList from './UserList';
import Chat from './Chat';
import GameControls from './GameControls';
import socketService from '../utils/socket';

/**
 * Room component - Main drawing interface (Quick Draw theme with image overlays)
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
  // Show "How to Play" on first visit
  const [showGuide, setShowGuide] = useState(false);

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
    };

    const handleGameEnded = (data) => {
      setIsGameActive(false);
      setIsDrawer(false);
      setGameState(prev => ({ ...prev, isRoundActive: false, maskedWord: '', selectedWord: '' }));
      
      const hasWinner = data.winner && data.winner.score > 0;
      setGameEvent({
        type: hasWinner ? 'winner' : 'no-winner',
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
      setGameEvent(null);
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
   * Renders game event overlays using the themed images
   */
  const renderGameEvent = () => {
    if (!gameEvent) return null;

    switch (gameEvent.type) {
      case 'game-started':
        return (
          <div className="event-overlay" onClick={() => setGameEvent(null)}>
            <div className="event-image-container event-bounce-in">
              <img 
                src="/front-page.png" 
                alt="Let's Play Quick Draw!" 
                className="event-hero-image char-bounce"
              />
              <div className="event-overlay-content">
                <p className="event-info-text">
                  {gameEvent.data.rounds} rounds • {gameEvent.data.drawTime}s each
                </p>
                <button className="event-action-btn" onClick={() => setGameEvent(null)}>
                  Let's Go! 🎨
                </button>
              </div>
            </div>
          </div>
        );

      case 'round-ended':
        return (
          <div className="event-overlay" onClick={() => setGameEvent(null)}>
            <div className="event-image-container event-bounce-in">
              <img 
                src="/guide.png" 
                alt="Round Over!" 
                className="event-hero-image char-wiggle"
              />
              <div className="event-overlay-content">
                <div className="event-word-reveal">
                  The word was: <strong>{gameEvent.data.word}</strong>
                </div>
                {gameEvent.data.scores && gameEvent.data.scores.length > 0 && (
                  <div className="event-scores-list">
                    {gameEvent.data.scores.slice(0, 5).map((player, i) => (
                      <div key={player.id || i} className="event-score-row">
                        <span className="event-rank">#{i + 1}</span>
                        <span className="event-name">{player.username}</span>
                        <span className="event-pts">{player.score || 0} pts</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="event-action-btn" onClick={() => setGameEvent(null)}>
                  Next Round →
                </button>
              </div>
            </div>
          </div>
        );

      case 'winner':
        return (
          <div className="event-overlay" onClick={() => setGameEvent(null)}>
            <div className="event-image-container event-bounce-in">
              <img 
                src="/winner.png" 
                alt="Winner!" 
                className="event-hero-image char-celebrate"
              />
              <div className="event-overlay-content">
                <div className="event-winner-text">
                  🏆 {gameEvent.data.winner.username} wins with {gameEvent.data.winner.score} points!
                </div>
                {gameEvent.data.scores && (
                  <div className="event-scores-list">
                    {gameEvent.data.scores.map((player, i) => (
                      <div key={player.id || i} className="event-score-row">
                        <span className="event-rank">#{i + 1}</span>
                        <span className="event-name">{player.username}</span>
                        <span className="event-pts">{player.score || 0} pts</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="event-action-btn" onClick={() => setGameEvent(null)}>
                  Play Again! 🎮
                </button>
              </div>
            </div>
          </div>
        );

      case 'no-winner':
        return (
          <div className="event-overlay" onClick={() => setGameEvent(null)}>
            <div className="event-image-container event-bounce-in">
              <img 
                src="/draw-match.png" 
                alt="No Winner!" 
                className="event-hero-image char-sad"
              />
              <div className="event-overlay-content">
                <p className="event-info-text">Better luck next time!</p>
                <button className="event-action-btn" onClick={() => setGameEvent(null)}>
                  Try Again! 💪
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * Guide overlay
   */
  const renderGuide = () => {
    if (!showGuide) return null;
    return (
      <div className="event-overlay" onClick={() => setShowGuide(false)}>
        <div className="event-image-container event-bounce-in">
          <img 
            src="/guide.png" 
            alt="How to Play" 
            className="event-hero-image char-wiggle"
          />
          <div className="event-overlay-content">
            <button className="event-action-btn" onClick={() => setShowGuide(false)}>
              Got it! ✨
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="room">
      <div className="room-content">
        <div className="main-area">
          {/* Left: Canvas Area */}
          <div className="canvas-area">
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

            {/* Game Controls */}
            {!isGameActive && (
              <div className="game-panel-controls">
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <GameControls
                    roomId={roomId}
                    currentUser={currentUser}
                    users={users}
                  />
                  <button 
                    className="guide-btn" 
                    onClick={() => setShowGuide(true)}
                    title="How to Play"
                  >
                    ❓ How to Play
                  </button>
                </div>
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

      {/* Game Event Overlays — Using themed images */}
      {renderGameEvent()}
      {renderGuide()}
    </div>
  );
};

export default Room;
