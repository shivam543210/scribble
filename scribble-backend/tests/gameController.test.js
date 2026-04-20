const gameController = require('../controllers/gameController');
const gameService = require('../services/gameService');

// Mock gameService
jest.mock('../services/gameService');

// Mock socket.io
jest.mock('../server', () => {
  return {
    io: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    }
  };
});

describe('GameController Unit Tests', () => {
  let req, res, mockIo;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIo = require('../server').io;
    req = {
      params: { roomId: 'room-123' },
      user: { id: 'host-123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('startGame', () => {
    it('should start game and emit socket events', async () => {
      const mockResult = {
        room: { id: 'room-123', totalRounds: 3 },
        round: { turnNumber: 1, startedAt: new Date() },
        drawer: { userId: 'player-456', user: { username: 'player' } },
        word: 'apple'
      };
      gameService.startGame.mockResolvedValue(mockResult);

      await gameController.startGame(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      
      // Verify Broadcast to room
      expect(mockIo.to).toHaveBeenCalledWith('room-123');
      expect(mockIo.emit).toHaveBeenCalledWith('game-started', expect.objectContaining({
        drawerId: 'player-456'
      }));

      // Verify Private emit to drawer
      expect(mockIo.to).toHaveBeenCalledWith('player-456');
      expect(mockIo.emit).toHaveBeenCalledWith('your-word', { word: 'apple' });
    });

    it('should handle service errors', async () => {
      gameService.startGame.mockRejectedValue(new Error('Validation error'));
      await gameController.startGame(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Validation error'
      }));
    });
  });
});
