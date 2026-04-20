const { prisma } = require('../config/db');
const { getRandomWord } = require('../utils/wordGenerator');

class GameService {
  /**
   * Starts a game in a room
   * @param {string} roomId - ID of the room
   * @param {string} hostId - ID of the user starting the game (host)
   * @returns {Promise<Object>} Game start details
   */
  async startGame(roomId, hostId) {
    // 1. Fetch room with participants
    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { 
        participants: {
          include: {
            user: { select: { id: true, username: true } }
          }
        } 
      }
    });

    // 2. Validations
    if (!room) throw new Error('Room not found');
    if (room.status !== 'WAITING') throw new Error('Game already started or ended');
    if (room.participants.length < 2) throw new Error('Minimum 2 players required to start');

    // Optional: Only host can start (assuming first participant is host)
    // In a real app, you might have a 'role' field in GameParticipant
    const isHost = room.participants[0].userId === hostId;
    if (!isHost) throw new Error('Only the host can start the game');

    // 3. Select random drawer
    const drawer = room.participants[Math.floor(Math.random() * room.participants.length)];
    const word = getRandomWord();

    // 4. DB Transaction: Set room to ACTIVE and create first Round
    const result = await prisma.$transaction(async (tx) => {
      const updatedRoom = await tx.gameRoom.update({
        where: { id: roomId },
        data: { status: 'ACTIVE' }
      });

      const round = await tx.round.create({
        data: {
          roomId,
          word,
          drawerId: drawer.userId,
          turnNumber: 1,
          startedAt: new Date()
        }
      });

      return { room: updatedRoom, round, participants: room.participants, drawer, word };
    });

    return result;
  }
}

module.exports = new GameService();
