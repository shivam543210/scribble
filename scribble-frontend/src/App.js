import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Room from './components/Room';
import useSocket from './hooks/useSocket';
import './styles/App.css';

/**
 * Main App component
 * Manages routing and socket state
 */
function App() {
  // useSocket hook returns:
  // { socket, roomId, roomName, currentUser, users, isConnected, createRoom, joinRoom }
  const { 
    socket, 
    roomId, 
    roomName, 
    currentUser, 
    users, 
    isConnected, 
    createRoom, 
    joinRoom 
  } = useSocket();

  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    // Update room status when roomId changes
    setIsInRoom(!!roomId);
  }, [roomId]);

  /**
   * Handles room creation
   * @param {string} roomName - Name of the room to create
   * @param {string} username - Username of the creator
   */
  const handleCreateRoom = (roomName, username) => {
    // createRoom calls socketService.createRoom which emits 'create-room'
    // Emits: { roomName: string, username: string }
    createRoom(roomName, username);
  };

  /**
   * Handles joining room
   * @param {string} roomId - ID of the room to join
   * @param {string} username - Username of the user
   */
  const handleJoinRoom = (roomId, username) => {
    // joinRoom calls socketService.joinRoom which emits 'join-room'
    // Emits: { roomId: string, username: string }
    joinRoom(roomId, username);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isInRoom ? (
                <Navigate to="/room" replace />
              ) : (
                <Home 
                  onCreateRoom={handleCreateRoom}
                  onJoinRoom={handleJoinRoom}
                />
              )
            } 
          />
          <Route 
            path="/room" 
            element={
              isInRoom ? (
                <Room 
                  roomId={roomId}
                  roomName={roomName}
                  currentUser={currentUser}
                  users={users}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {!isConnected && (
          <div className="connection-status">
            Connecting to server...
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
