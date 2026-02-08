// Frontend Socket.IO Connection Example
// Install: npm install socket.io-client

import { io } from 'socket.io-client';

// Create socket connection
// Options: { transports: Array }
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
});

// Connection event - Triggered when socket connects to server
// Receives: No data
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

// Disconnect event - Triggered when socket disconnects
// Receives: No data
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// ========== EMIT EVENTS (Client → Server) ==========

// Create a new room
// Send: { roomName: string, username: string }
const createRoom = (roomName, username) => {
  socket.emit('create-room', { roomName, username });
};

// Join existing room
// Send: { roomId: string, username: string }
const joinRoom = (roomId, username) => {
  socket.emit('join-room', { roomId, username });
};

// Send drawing data
// Send: { roomId: string, drawingData: { type: string, points: Array, color: string, lineWidth: number } }
const sendDrawing = (roomId, drawingData) => {
  socket.emit('drawing', { roomId, drawingData });
};

// Clear canvas
// Send: { roomId: string }
const clearCanvas = (roomId) => {
  socket.emit('clear-canvas', { roomId });
};

// Send chat message
// Send: { roomId: string, message: string }
const sendChatMessage = (roomId, message) => {
  socket.emit('chat-message', { roomId, message });
};

// ========== LISTEN EVENTS (Server → Client) ==========

// Room created successfully
// Receives: { roomId: string, roomName: string, user: { id: string, username: string, color: string } }
socket.on('room-created', (data) => {
  console.log('Room created:', data.roomId);
  console.log('User info:', data.user);
  // Store roomId and user info in state
});

// Successfully joined room
// Receives: { roomId: string, roomName: string, user: Object, users: Array, drawingData: Array }
socket.on('room-joined', (data) => {
  console.log('Joined room:', data.roomId);
  console.log('Current users:', data.users);
  console.log('Drawing history:', data.drawingData);
  // Render existing drawing data on canvas
  // Update user list
});

// New user joined the room
// Receives: { user: { id: string, username: string, color: string } }
socket.on('user-joined', (data) => {
  console.log('User joined:', data.user.username);
  // Add user to user list
  // Show notification
});

// User left the room
// Receives: { user: { id: string, username: string, color: string } }
socket.on('user-left', (data) => {
  console.log('User left:', data.user.username);
  // Remove user from user list
  // Show notification
});

// Receive drawing data from other users
// Receives: { drawingData: { type: string, points: Array, color: string, lineWidth: number }, userId: string }
socket.on('drawing', (data) => {
  console.log('Drawing received from:', data.userId);
  // Render drawing on canvas
  const { type, points, color, lineWidth } = data.drawingData;
  
  if (type === 'draw') {
    // Draw line on canvas using points, color, lineWidth
  } else if (type === 'erase') {
    // Erase on canvas using points
  }
});

// Canvas cleared by another user
// Receives: No data
socket.on('canvas-cleared', () => {
  console.log('Canvas cleared');
  // Clear your local canvas
});

// Receive chat message
// Receives: { user: { id: string, username: string, color: string }, message: string, timestamp: number }
socket.on('chat-message', (data) => {
  console.log(`${data.user.username}: ${data.message}`);
  // Add message to chat UI
});

// Error from server
// Receives: { error: string }
socket.on('error', (data) => {
  console.error('Error:', data.error);
  // Show error notification to user
});

// ========== EXAMPLE USAGE IN REACT ==========

/*
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function DrawingApp() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // Initialize socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    // Setup listeners
    newSocket.on('room-created', (data) => {
      setRoomId(data.roomId);
    });
    
    newSocket.on('room-joined', (data) => {
      setRoomId(data.roomId);
      setUsers(data.users);
      // Render drawing history
    });
    
    newSocket.on('user-joined', (data) => {
      setUsers(prev => [...prev, data.user]);
    });
    
    newSocket.on('user-left', (data) => {
      setUsers(prev => prev.filter(u => u.id !== data.user.id));
    });
    
    newSocket.on('drawing', (data) => {
      // Render drawing on canvas
    });
    
    newSocket.on('canvas-cleared', () => {
      // Clear canvas
    });
    
    // Cleanup
    return () => newSocket.close();
  }, []);
  
  const handleCreateRoom = () => {
    socket.emit('create-room', {
      roomName: 'My Room',
      username: 'User123'
    });
  };
  
  const handleDraw = (drawingData) => {
    socket.emit('drawing', {
      roomId,
      drawingData
    });
  };
  
  return (
    <div>
      <button onClick={handleCreateRoom}>Create Room</button>
      {/* Canvas and UI */}
    </div>
  );
}
*/

export {
  socket,
  createRoom,
  joinRoom,
  sendDrawing,
  clearCanvas,
  sendChatMessage
};
