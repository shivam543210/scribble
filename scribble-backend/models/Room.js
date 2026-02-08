const { v4: uuidv4 } = require('uuid');

class Room {
  constructor() {
    // Map structure: roomId -> { id, name, users: [], drawingData: [] }
    this.rooms = new Map();
  }

  /**
   * Creates a new room
   * @param {string} roomName - Name of the room
   * @returns {Object} { id: string, name: string, users: [], drawingData: [] }
   */
  createRoom(roomName) {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: roomName,
      users: [],
      drawingData: [], // Array to store all drawing events
      createdAt: new Date()
    };
    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Gets room by ID
   * @param {string} roomId - ID of the room
   * @returns {Object|null} Room object or null
   */
  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Adds user to room
   * @param {string} roomId - ID of the room
   * @param {Object} user - { id: string, username: string, color: string }
   * @returns {boolean} Success status
   */
  addUser(roomId, user) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.users.push(user);
    return true;
  }

  /**
   * Removes user from room
   * @param {string} roomId - ID of the room
   * @param {string} userId - Socket ID of the user
   * @returns {Object|null} Removed user object or null
   */
  removeUser(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const userIndex = room.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    const removedUser = room.users.splice(userIndex, 1)[0];
    
    // Delete room if no users left
    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }
    
    return removedUser;
  }

  /**
   * Adds drawing data to room
   * @param {string} roomId - ID of the room
   * @param {Object} drawingEvent - { type: string, data: Object, userId: string, timestamp: number }
   * @returns {boolean} Success status
   */
  addDrawingData(roomId, drawingEvent) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.drawingData.push(drawingEvent);
    return true;
  }

  /**
   * Gets all drawing data for a room
   * @param {string} roomId - ID of the room
   * @returns {Array} Array of drawing events
   */
  getDrawingData(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.drawingData : [];
  }

  /**
   * Clears drawing data for a room
   * @param {string} roomId - ID of the room
   * @returns {boolean} Success status
   */
  clearDrawingData(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.drawingData = [];
    return true;
  }

  /**
   * Gets all rooms
   * @returns {Array} Array of all rooms
   */
  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  /**
   * Gets user from room
   * @param {string} roomId - ID of the room
   * @param {string} userId - Socket ID of the user
   * @returns {Object|null} User object or null
   */
  getUser(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    return room.users.find(u => u.id === userId) || null;
  }
}

module.exports = new Room();
