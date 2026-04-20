const { prismaMock } = require('./singleton');
const gameService = require('../services/gameService');
const wordGenerator = require('../utils/wordGenerator');

// Mock wordGenerator
jest.mock('../utils/wordGenerator', () => ({
  getRandomWord: jest.fn()
}));

describe('GameService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startGame', () => {
    const roomId = 'room-123';
    const hostId = 'host-123';
    const mockRoom = {
      id: roomId,
      status: 'WAITING',
      totalRounds: 3,
      participants: [
        { userId: hostId, user: { id: hostId, username: 'host' } },
        { userId: 'player-456', user: { id: 'player-456', username: 'player' } }
      ]
    };

    it('should successfully start the game', async () => {
      prismaMock.gameRoom.findUnique.mockResolvedValue(mockRoom);
      wordGenerator.getRandomWord.mockReturnValue('apple');
      
      // Mock transaction
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      prismaMock.gameRoom.update.mockResolvedValue({ ...mockRoom, status: 'ACTIVE' });
      prismaMock.round.create.mockResolvedValue({ id: 'round-1', turnNumber: 1 });

      const result = await gameService.startGame(roomId, hostId);

      expect(result.room.status).toBe('ACTIVE');
      expect(result.word).toBe('apple');
      expect(prismaMock.gameRoom.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: roomId },
        data: { status: 'ACTIVE' }
      }));
      expect(prismaMock.round.create).toHaveBeenCalled();
    });

    it('should throw error if room not found', async () => {
      prismaMock.gameRoom.findUnique.mockResolvedValue(null);
      await expect(gameService.startGame(roomId, hostId)).rejects.toThrow('Room not found');
    });

    it('should throw error if game already started', async () => {
      prismaMock.gameRoom.findUnique.mockResolvedValue({ ...mockRoom, status: 'ACTIVE' });
      await expect(gameService.startGame(roomId, hostId)).rejects.toThrow('Game already started or ended');
    });

    it('should throw error if less than 2 players', async () => {
      prismaMock.gameRoom.findUnique.mockResolvedValue({
        ...mockRoom,
        participants: [{ userId: hostId }]
      });
      await expect(gameService.startGame(roomId, hostId)).rejects.toThrow('Minimum 2 players required to start');
    });

    it('should throw error if non-host tries to start', async () => {
      prismaMock.gameRoom.findUnique.mockResolvedValue(mockRoom);
      await expect(gameService.startGame(roomId, 'not-host')).rejects.toThrow('Only the host can start the game');
    });
  });
});
