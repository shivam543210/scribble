import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Canvas from './Canvas';
import UserList from './UserList';
import Chat from './Chat';
import GameControls from './GameControls';
import socketService from '../utils/socket';

/**
 * Room component - Main drawing interface (Updated with game mode)
 * Props: { 
 *   roomId: string,
 *   roomName: string,
 *   currentUser: { id: string, username: string, color: string },
 *   users: Array<{ id: string, username: string, color: string }>
 * }
 */
const Room = ({ roomId, roomName, currentUser, users }) => {
  const [drawingData, setDrawingData] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [showGame, setShowGame] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isDrawer, setIsDrawer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for initial drawing data when joining room
    // Receives: { roomId: string, roomName: string, user: Object, users: Array, drawingData: Array, gameState: Object }
    const handleRoomJoined = (data) => {
      if (data.drawingData) {
        setDrawingData(data.drawingData);
      }
      if (data.gameState) {
        setIsGameActive(data.gameState.isActive);
        setIsDrawer(data.gameState.currentDrawer === currentUser.id);
      }
    };

    // Listen for game state changes
    // Receives: { rounds: number, drawTime: number }
    const handleGameStarted = () => {
      setIsGameActive(true);
    };

    // Receives: { winner: Object, scores: Array }
    const handleGameEnded = () => {
      setIsGameActive(false);
      setIsDrawer(false);
    };

    // Receives: { drawer: Object, wordOptions: Array, round: number, totalRounds: number }
    const handleRoundStartedDrawer = (data) => {
      setIsDrawer(data.drawer.id === currentUser.id);
    };

    // Receives: { drawer: Object, round: number, totalRounds: number }
    const handleRoundStartedGuesser = (data) => {
      setIsDrawer(data.drawer.id === currentUser.id);
    };

    socketService.onRoomJoined(handleRoomJoined);
    socketService.socket.on('game-started', handleGameStarted);
    socketService.socket.on('game-ended', handleGameEnded);
    socketService.socket.on('round-started-drawer', handleRoundStartedDrawer);
    socketService.socket.on('round-started-guesser', handleRoundStartedGuesser);

    return () => {
      socketService.off('room-joined', handleRoomJoined);
      socketService.socket.off('game-started', handleGameStarted);
      socketService.socket.off('game-ended', handleGameEnded);
      socketService.socket.off('round-started-drawer', handleRoundStartedDrawer);
      socketService.socket.off('round-started-guesser', handleRoundStartedGuesser);
    };
  }, [currentUser]);

  /**
   * Handles leave room
   */
  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave the room?')) {
      socketService.disconnect();
      navigate('/');
      window.location.reload();
    }
  };

  /**
   * Copies room ID to clipboard
   */
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  return (
    <div className="room">
      <header className="room-header">
        <div className="room-info">
          <h2>{roomName}</h2>
          <div className="room-id">
            <span>Room ID: {roomId}</span>
            <button onClick={copyRoomId} className="copy-btn" title="Copy Room ID">
              📋
            </button>
          </div>
        </div>
        <button onClick={handleLeaveRoom} className="leave-btn">
          Leave Room
        </button>
      </header>

      <div className="room-content">
        <div className="left-sidebar">
          {showUsers && (
            <UserList users={users} currentUser={currentUser} />
          )}
          <button 
            onClick={() => setShowUsers(!showUsers)}
            className="toggle-sidebar-btn"
          >
            {showUsers ? '← Hide Users' : '→ Show Users'}
          </button>
        </div>

        <div className="main-area">
          {showGame && (
            <div className="game-controls-container">
              <GameControls 
                roomId={roomId}
                currentUser={currentUser}
                users={users}
              />
            </div>
          )}
          
          <div className="canvas-area">
            <Canvas 
              roomId={roomId} 
              currentUser={currentUser}
              initialDrawingData={drawingData}
              isDrawer={isDrawer}
              isGameActive={isGameActive}
            />
          </div>
        </div>

        <div className="right-sidebar">
          {showChat && (
            <Chat 
              roomId={roomId} 
              currentUser={currentUser}
              isGameActive={isGameActive}
            />
          )}
          <button 
            onClick={() => setShowChat(!showChat)}
            className="toggle-sidebar-btn"
          >
            {showChat ? 'Hide Chat →' : '← Show Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;
