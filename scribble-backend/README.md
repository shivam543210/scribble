# Scribble Backend

Real-time collaborative drawing application backend built with Node.js, Express, and Socket.IO following MVC pattern.

## Features

- Real-time collaborative drawing using Socket.IO
- Room-based collaboration
- User presence management
- Drawing history persistence per room
- Chat functionality
- REST API for room management

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

Development mode with nodemon:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Project Structure

```
scribble-backend/
├── controllers/
│   ├── socketController.js    # Socket.IO event handlers
│   └── roomController.js       # REST API controllers
├── models/
│   └── Room.js                 # Room data model
├── routes/
│   └── api.js                  # REST API routes
├── config/
│   └── socket.js               # Socket.IO configuration
├── middleware/
│   └── errorHandler.js         # Error handling middleware
├── server.js                   # Main server file
├── package.json
└── .env
```

## REST API Endpoints

### Get All Rooms
```
GET /api/rooms
Response: { success: true, rooms: Array }
```

### Get Room Details
```
GET /api/rooms/:roomId
Response: { success: true, room: Object }
```

### Check Room Exists
```
GET /api/rooms/:roomId/exists
Response: { exists: boolean }
```

## Socket.IO Events

### Client → Server Events

#### 1. create-room
Creates a new drawing room
```javascript
socket.emit('create-room', {
  roomName: string,    // Name of the room
  username: string     // Username of creator
});
```

#### 2. join-room
Joins an existing room
```javascript
socket.emit('join-room', {
  roomId: string,      // ID of the room to join
  username: string     // Username of the user
});
```

#### 3. drawing
Sends drawing data to other users
```javascript
socket.emit('drawing', {
  roomId: string,
  drawingData: {
    type: 'draw' | 'erase',
    points: Array,       // Array of {x, y} coordinates
    color: string,       // Hex color code
    lineWidth: number    // Width of the line
  }
});
```

#### 4. clear-canvas
Clears the canvas for all users in the room
```javascript
socket.emit('clear-canvas', {
  roomId: string
});
```

#### 5. chat-message
Sends a chat message to the room
```javascript
socket.emit('chat-message', {
  roomId: string,
  message: string
});
```

### Server → Client Events

#### 1. room-created
Sent when a room is successfully created
```javascript
socket.on('room-created', (data) => {
  // data: {
  //   roomId: string,
  //   roomName: string,
  //   user: { id: string, username: string, color: string }
  // }
});
```

#### 2. room-joined
Sent when user successfully joins a room
```javascript
socket.on('room-joined', (data) => {
  // data: {
  //   roomId: string,
  //   roomName: string,
  //   user: { id: string, username: string, color: string },
  //   users: Array,        // All users in the room
  //   drawingData: Array   // Existing drawing history
  // }
});
```

#### 3. user-joined
Sent to all users when someone joins the room
```javascript
socket.on('user-joined', (data) => {
  // data: {
  //   user: { id: string, username: string, color: string }
  // }
});
```

#### 4. user-left
Sent to all users when someone leaves the room
```javascript
socket.on('user-left', (data) => {
  // data: {
  //   user: { id: string, username: string, color: string }
  // }
});
```

#### 5. drawing
Receives drawing data from other users
```javascript
socket.on('drawing', (data) => {
  // data: {
  //   drawingData: {
  //     type: 'draw' | 'erase',
  //     points: Array,
  //     color: string,
  //     lineWidth: number
  //   },
  //   userId: string  // Socket ID of the user who drew
  // }
});
```

#### 6. canvas-cleared
Sent when canvas is cleared
```javascript
socket.on('canvas-cleared', () => {
  // Clear your local canvas
});
```

#### 7. chat-message
Receives chat messages
```javascript
socket.on('chat-message', (data) => {
  // data: {
  //   user: { id: string, username: string, color: string },
  //   message: string,
  //   timestamp: number
  // }
});
```

#### 8. error
Receives error messages
```javascript
socket.on('error', (data) => {
  // data: {
  //   error: string
  // }
});
```

## License

ISC
