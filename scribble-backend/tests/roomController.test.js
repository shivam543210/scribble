const roomController = require('../controllers/roomController');
const roomService = require('../services/roomService');

// Mock roomService
jest.mock('../services/roomService');

describe('RoomController Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user-123' },
      body: { maxPlayers: 8, totalRounds: 4 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createRoom', () => {
    it('should successfully create a room and return 201', async () => {
      const mockRoom = { id: 'room-123', code: 'ABC123' };
      roomService.createRoom.mockResolvedValue(mockRoom);

      await roomController.createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRoom
      });
      expect(roomService.createRoom).toHaveBeenCalledWith({
        userId: 'user-123',
        maxPlayers: 8,
        totalRounds: 4
      });
    });

    it('should return 500 if room creation fails', async () => {
      roomService.createRoom.mockRejectedValue(new Error('DB Error'));

      await roomController.createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DB Error'
      });
    });
  });
});
