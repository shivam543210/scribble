const roomService = require('../services/roomService');
const { prisma } = require('../config/db');

class RoomController {
  /**
   * Create a new game room
   */
  async createRoom(req, res) {
    try {
      const { maxPlayers, totalRounds } = req.body;
      const userId = req.user.id;

      const room = await roomService.createRoom({
        userId,
        maxPlayers,
        totalRounds
      });

      res.status(201).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create room'
      });
    }
  }

  /**
   * Get all active rooms
   */
  async getAllRooms(req, res) {
    try {
      const rooms = await prisma.gameRoom.findMany({
        where: { status: 'WAITING' },
        include: {
          _count: {
            select: { participants: true }
          }
        }
      });

      const formattedRooms = rooms.map(room => ({
        id: room.id,
        code: room.code,
        status: room.status,
        maxPlayers: room.maxPlayers,
        userCount: room._count.participants,
        createdAt: room.createdAt
      }));

      res.json({
        success: true,
        rooms: formattedRooms
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rooms'
      });
    }
  }

  /**
   * Get specific room details
   */
  async getRoomById(req, res) {
    try {
      const { roomId } = req.params;
      const room = await prisma.gameRoom.findUnique({
        where: { id: roomId },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, username: true }
              }
            }
          }
        }
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      res.json({
        success: true,
        room
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch room'
      });
    }
  }

  /**
   * Check if room exists
   */
  async checkRoomExists(req, res) {
    try {
      const { roomId } = req.params;
      const count = await prisma.gameRoom.count({
        where: { id: roomId }
      });

      res.json({
        exists: count > 0
      });
    } catch (error) {
      res.status(500).json({
        exists: false,
        error: 'Failed to check room'
      });
    }
  }
}

module.exports = new RoomController();
