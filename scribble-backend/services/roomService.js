const { prisma } = require('../config/db');
const { generateCode } = require('../utils/roomCode');

class RoomService {
  /**
   * Create a new game room
   * @param {Object} roomData - Room configuration and creator ID
   * @returns {Promise<Object>} Created room with participants
   */
  async createRoom(roomData) {
    const { userId, maxPlayers, totalRounds } = roomData;

    // Generate a unique code
    let code;
    let isUnique = false;
    
    // Simple retry logic for unique code
    while (!isUnique) {
      code = generateCode();
      const existing = await prisma.gameRoom.findUnique({ where: { code } });
      if (!existing) isUnique = true;
    }

    // Create room and add host as participant in a transaction
    return await prisma.gameRoom.create({
      data: {
        code,
        status: 'WAITING',
        maxPlayers: parseInt(maxPlayers) || 6,
        totalRounds: parseInt(totalRounds) || 3,
        participants: {
          create: {
            userId,
            score: 0,
            isActive: true
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });
  }
}

module.exports = new RoomService();
