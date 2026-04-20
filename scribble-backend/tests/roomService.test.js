const { prismaMock } = require('./singleton');
const roomService = require('../services/roomService');
const roomCodeUtil = require('../utils/roomCode');

// Mock roomCode util to control generated codes
jest.mock('../utils/roomCode', () => ({
  generateCode: jest.fn()
}));

describe('RoomService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should successfully create a room with custom values', async () => {
      const roomData = {
        userId: 'host-123',
        maxPlayers: 10,
        totalRounds: 5
      };

      roomCodeUtil.generateCode.mockReturnValue('NEW123');
      prismaMock.gameRoom.findUnique.mockResolvedValue(null);
      prismaMock.gameRoom.create.mockResolvedValue({
        id: 'room-123',
        code: 'NEW123',
        maxPlayers: 10,
        totalRounds: 5,
        participants: [{ userId: 'host-123' }]
      });

      const result = await roomService.createRoom(roomData);

      expect(result.code).toBe('NEW123');
      expect(result.maxPlayers).toBe(10);
      expect(prismaMock.gameRoom.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          maxPlayers: 10,
          totalRounds: 5
        })
      }));
    });

    it('should use default values if maxPlayers or totalRounds are missing', async () => {
      const roomData = { userId: 'host-123' };

      roomCodeUtil.generateCode.mockReturnValue('DEF123');
      prismaMock.gameRoom.findUnique.mockResolvedValue(null);
      prismaMock.gameRoom.create.mockResolvedValue({
        id: 'room-456',
        code: 'DEF123',
        maxPlayers: 6,
        totalRounds: 3
      });

      await roomService.createRoom(roomData);

      expect(prismaMock.gameRoom.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          maxPlayers: 6,
          totalRounds: 3
        })
      }));
    });

    it('should retry if room code collision occurs', async () => {
      const roomData = { userId: 'host-123' };

      // First call returns collision, second call returns unique
      roomCodeUtil.generateCode
        .mockReturnValueOnce('COLLID')
        .mockReturnValueOnce('UNIQUE');

      prismaMock.gameRoom.findUnique
        .mockResolvedValueOnce({ id: 'existing' }) // Collision
        .mockResolvedValueOnce(null); // Unique

      prismaMock.gameRoom.create.mockResolvedValue({
        id: 'room-789',
        code: 'UNIQUE'
      });

      const result = await roomService.createRoom(roomData);

      expect(result.code).toBe('UNIQUE');
      expect(roomCodeUtil.generateCode).toHaveBeenCalledTimes(2);
    });
  });
});
