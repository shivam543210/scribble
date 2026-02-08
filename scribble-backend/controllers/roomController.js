const Room = require('../models/Room');

class RoomController {
  /**
   * Get all active rooms
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object with methods: { json: Function, status: Function }
   */
  getAllRooms(req, res) {
    try {
      const rooms = Room.getAllRooms();
      
      // Format response
      const formattedRooms = rooms.map(room => ({
        id: room.id,
        name: room.name,
        userCount: room.users.length,
        createdAt: room.createdAt
      }));

      // Sends: { success: true, rooms: Array<{ id, name, userCount, createdAt }> }
      res.json({
        success: true,
        rooms: formattedRooms
      });
    } catch (error) {
      // Sends: { success: false, error: string }
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rooms'
      });
    }
  }

  /**
   * Get specific room details
   * @param {Request} req - Express request with params: { roomId: string }
   * @param {Response} res - Express response object
   */
  getRoomById(req, res) {
    try {
      const { roomId } = req.params;
      const room = Room.getRoom(roomId);

      if (!room) {
        // Sends: { success: false, error: string }
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      // Sends: { success: true, room: { id, name, users: Array, userCount, createdAt } }
      res.json({
        success: true,
        room: {
          id: room.id,
          name: room.name,
          users: room.users,
          userCount: room.users.length,
          createdAt: room.createdAt
        }
      });
    } catch (error) {
      // Sends: { success: false, error: string }
      res.status(500).json({
        success: false,
        error: 'Failed to fetch room'
      });
    }
  }

  /**
   * Check if room exists
   * @param {Request} req - Express request with params: { roomId: string }
   * @param {Response} res - Express response object
   */
  checkRoomExists(req, res) {
    try {
      const { roomId } = req.params;
      const room = Room.getRoom(roomId);

      // Sends: { exists: boolean }
      res.json({
        exists: !!room
      });
    } catch (error) {
      // Sends: { exists: false, error: string }
      res.status(500).json({
        exists: false,
        error: 'Failed to check room'
      });
    }
  }
}

module.exports = new RoomController();
