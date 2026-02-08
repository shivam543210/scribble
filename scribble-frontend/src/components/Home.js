import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Home component - Landing page for creating or joining rooms
 * Props: { 
 *   onCreateRoom: Function - (roomName: string, username: string) => void,
 *   onJoinRoom: Function - (roomId: string, username: string) => void
 * }
 */
const Home = ({ onCreateRoom, onJoinRoom }) => {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const navigate = useNavigate();

  /**
   * Handles create room form submit
   * @param {Event} e - Form submit event
   */
  const handleCreateRoom = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !roomName.trim()) {
      alert('Please enter both username and room name');
      return;
    }

    // Call parent function to create room
    // Function expects: (roomName: string, username: string)
    onCreateRoom(roomName, username);
  };

  /**
   * Handles join room form submit
   * @param {Event} e - Form submit event
   */
  const handleJoinRoom = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !roomId.trim()) {
      alert('Please enter both username and room ID');
      return;
    }

    // Call parent function to join room
    // Function expects: (roomId: string, username: string)
    onJoinRoom(roomId, username);
  };

  return (
    <div className="home">
      <div className="home-container">
        <h1>🎨 Scribble</h1>
        <p className="subtitle">Collaborative Drawing in Real-time</p>

        <div className="mode-selector">
          <button
            className={mode === 'create' ? 'active' : ''}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
          <button
            className={mode === 'join' ? 'active' : ''}
            onClick={() => setMode('join')}
          >
            Join Room
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreateRoom} className="room-form">
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              maxLength={20}
            />
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="form-input"
              maxLength={30}
            />
            <button type="submit" className="form-button">
              Create Room
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="room-form">
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              maxLength={20}
            />
            <input
              type="text"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="form-button">
              Join Room
            </button>
          </form>
        )}

        <div className="info-box">
          <h3>How it works</h3>
          <ul>
            <li>Create a room or join an existing one</li>
            <li>Share the Room ID with friends</li>
            <li>Draw together in real-time</li>
            <li>Chat while you draw</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
