import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

/**
 * Creates and initializes socket connection
 * Returns: Socket instance with methods { emit: Function, on: Function, off: Function, disconnect: Function }
 */
class SocketService {
  constructor() {
    this.socket = null;
  }

  /**
   * Connects to Socket.IO server
   * Options: { transports: Array, reconnection: boolean }
   */
  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    // Connection event - Triggered when socket connects
    // Receives: No data
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
    });

    // Disconnect event - Triggered when socket disconnects
    // Receives: No data
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  /**
   * Disconnects from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Creates a new room
   * Emits: 'create-room'
   * Sends: { roomName: string, username: string }
   * @param {string} roomName - Name of the room to create
   * @param {string} username - Username of the creator
   */
  createRoom(roomName, username) {
    this.socket.emit('create-room', { roomName, username });
  }

  /**
   * Joins an existing room
   * Emits: 'join-room'
   * Sends: { roomId: string, username: string }
   * @param {string} roomId - ID of the room to join
   * @param {string} username - Username of the user
   */
  joinRoom(roomId, username) {
    this.socket.emit('join-room', { roomId, username });
  }

  /**
   * Sends drawing data to other users in room
   * Emits: 'drawing'
   * Sends: { roomId: string, drawingData: { type: string, points: Array, color: string, lineWidth: number } }
   * @param {string} roomId - ID of the room
   * @param {Object} drawingData - Drawing data object
   */
  sendDrawing(roomId, drawingData) {
    this.socket.emit('drawing', { roomId, drawingData });
  }

  /**
   * Clears canvas for all users in room
   * Emits: 'clear-canvas'
   * Sends: { roomId: string }
   * @param {string} roomId - ID of the room
   */
  clearCanvas(roomId) {
    this.socket.emit('clear-canvas', { roomId });
  }

  /**
   * Sends chat message to room
   * Emits: 'chat-message'
   * Sends: { roomId: string, message: string }
   * @param {string} roomId - ID of the room
   * @param {string} message - Message text
   */
  sendChatMessage(roomId, message) {
    this.socket.emit('chat-message', { roomId, message });
  }

  /**
   * Listens for room created event
   * Event: 'room-created'
   * Receives: { roomId: string, roomName: string, user: { id: string, username: string, color: string } }
   * @param {Function} callback - Callback function receiving room data
   */
  onRoomCreated(callback) {
    this.socket.on('room-created', callback);
  }

  /**
   * Listens for room joined event
   * Event: 'room-joined'
   * Receives: { roomId: string, roomName: string, user: Object, users: Array, drawingData: Array }
   * @param {Function} callback - Callback function receiving join data
   */
  onRoomJoined(callback) {
    this.socket.on('room-joined', callback);
  }

  /**
   * Listens for user joined event
   * Event: 'user-joined'
   * Receives: { user: { id: string, username: string, color: string } }
   * @param {Function} callback - Callback function receiving user data
   */
  onUserJoined(callback) {
    this.socket.on('user-joined', callback);
  }

  /**
   * Listens for user left event
   * Event: 'user-left'
   * Receives: { user: { id: string, username: string, color: string } }
   * @param {Function} callback - Callback function receiving user data
   */
  onUserLeft(callback) {
    this.socket.on('user-left', callback);
  }

  /**
   * Listens for drawing event from other users
   * Event: 'drawing'
   * Receives: { drawingData: { type: string, points: Array, color: string, lineWidth: number }, userId: string }
   * @param {Function} callback - Callback function receiving drawing data
   */
  onDrawing(callback) {
    this.socket.on('drawing', callback);
  }

  /**
   * Listens for canvas cleared event
   * Event: 'canvas-cleared'
   * Receives: No data
   * @param {Function} callback - Callback function
   */
  onCanvasCleared(callback) {
    this.socket.on('canvas-cleared', callback);
  }

  /**
   * Listens for chat message event
   * Event: 'chat-message'
   * Receives: { user: { id: string, username: string, color: string }, message: string, timestamp: number }
   * @param {Function} callback - Callback function receiving message data
   */
  onChatMessage(callback) {
    this.socket.on('chat-message', callback);
  }

  /**
   * Listens for error event
   * Event: 'error'
   * Receives: { error: string }
   * @param {Function} callback - Callback function receiving error
   */
  onError(callback) {
    this.socket.on('error', callback);
  }

  /**
   * Removes event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback to remove
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Gets socket ID
   * @returns {string} Socket ID
   */
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

export default new SocketService();
