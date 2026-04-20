const gameService = require('../services/gameService');

class GameController {
  /**
   * Start the game in a room
   */
  async startGame(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const result = await gameService.startGame(roomId, userId);

      // Get io instance from app (it's attached in server.js usually, or we can require it)
      // Since server.js exports it, we can require it here.
      const { io } = require('../server');

      // 1. Broadcast "game-started" to the whole room (including drawer)
      // We don't send the word here!
      io.to(roomId).emit('game-started', {
        roomId: result.room.id,
        round: result.round.turnNumber,
        drawerId: result.drawer.userId,
        drawerName: result.drawer.user.username,
        startTime: result.round.startedAt,
        totalRounds: result.room.totalRounds,
        maxPlayers: result.room.maxPlayers
      });

      // 2. Private emit the word to ONLY the drawer
      // Using the user-room pattern: io.to(userId).emit(...)
      io.to(result.drawer.userId).emit('your-word', { 
        word: result.word 
      });

      res.status(200).json({
        success: true,
        message: 'Game started successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to start game'
      });
    }
  }
}

module.exports = new GameController();
