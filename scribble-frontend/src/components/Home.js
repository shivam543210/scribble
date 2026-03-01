import React, { useState } from 'react';

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
  const [mode, setMode] = useState('create');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !roomName.trim()) {
      alert('Please enter both username and room name');
      return;
    }

    onCreateRoom(roomName, username);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !roomId.trim()) {
      alert('Please enter both username and room ID');
      return;
    }

    onJoinRoom(roomId, username);
  };

  return (
    <div className="home">
      {/* Decorative floating shapes */}
      <div style={{
        position: 'absolute', top: '10%', left: '10%',
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(102,126,234,0.15)', animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '15%',
        width: '120px', height: '120px', borderRadius: '20px',
        background: 'rgba(118,75,162,0.12)', animation: 'float 8s ease-in-out infinite',
        transform: 'rotate(45deg)'
      }} />
      <div style={{
        position: 'absolute', top: '50%', right: '8%',
        width: '50px', height: '50px', borderRadius: '50%',
        background: 'rgba(34,197,94,0.12)', animation: 'float 5s ease-in-out infinite reverse'
      }} />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div className="home-container">
        <h1>🎨 Scribble</h1>
        <p className="subtitle">Draw, Guess & Have Fun!</p>

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
            <li>Guess words and earn points!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
