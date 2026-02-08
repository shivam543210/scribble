# Scribble Frontend

Real-time collaborative drawing application built with React and Socket.IO.

## Features

- Real-time collaborative drawing
- Room-based collaboration
- User presence management
- Live chat
- Drawing tools (pen, eraser, colors, line width)
- Canvas clearing
- Responsive design
- Touch device support

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

Development mode:
```bash
npm start
```

The app will open at `http://localhost:3000`

Build for production:
```bash
npm run build
```

## Project Structure

```
scribble-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Canvas.js          # Drawing canvas component
│   │   ├── Chat.js            # Chat component
│   │   ├── Home.js            # Landing page
│   │   ├── Room.js            # Main room interface
│   │   └── UserList.js        # User list component
│   ├── hooks/
│   │   └── useSocket.js       # Custom Socket.IO hook
│   ├── utils/
│   │   └── socket.js          # Socket.IO service
│   ├── styles/
│   │   ├── App.css            # Main styles
│   │   └── index.css          # Base styles
│   ├── App.js                 # Main app component
│   └── index.js               # Entry point
├── package.json
└── .env
```

## Socket.IO Integration

The frontend connects to the backend Socket.IO server and handles the following events:

### Client → Server (Emit)

- `create-room` - Creates a new room
- `join-room` - Joins an existing room
- `drawing` - Sends drawing data to other users
- `clear-canvas` - Clears the canvas for all users
- `chat-message` - Sends a chat message

### Server → Client (Listen)

- `room-created` - Room successfully created
- `room-joined` - Successfully joined a room
- `user-joined` - New user joined the room
- `user-left` - User left the room
- `drawing` - Receive drawing data from other users
- `canvas-cleared` - Canvas was cleared
- `chat-message` - Receive chat messages
- `error` - Error messages from server

## Components Overview

### Canvas Component
Handles all drawing functionality including:
- Mouse and touch event handling
- Real-time drawing synchronization
- Drawing tools (pen, eraser)
- Color and line width selection
- Canvas clearing

### Home Component
Landing page with options to:
- Create a new room
- Join an existing room with Room ID

### Room Component
Main drawing interface with:
- Canvas area
- User list sidebar
- Chat sidebar
- Room information header

### Chat Component
Real-time chat functionality with:
- Message history
- Timestamp display
- Auto-scrolling

### UserList Component
Displays all active users in the room with:
- Username
- User color indicator
- Current user highlight

## Usage

1. Start the backend server first (see backend README)
2. Start the frontend: `npm start`
3. Create a room or join with a Room ID
4. Share the Room ID with others to collaborate
5. Start drawing together in real-time!

## Socket Service Methods

All Socket.IO interactions are handled through the `socketService` utility:

```javascript
// Connect to server
socketService.connect()

// Create room
socketService.createRoom(roomName, username)

// Join room
socketService.joinRoom(roomId, username)

// Send drawing
socketService.sendDrawing(roomId, drawingData)

// Clear canvas
socketService.clearCanvas(roomId)

// Send chat message
socketService.sendChatMessage(roomId, message)

// Listen for events
socketService.onRoomCreated(callback)
socketService.onDrawing(callback)
socketService.onChatMessage(callback)
// ... and more
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- Use a modern browser for best performance
- Limit the number of simultaneous users in a room (recommended: 2-10 users)
- Clear canvas periodically for complex drawings to improve performance

## License

ISC
