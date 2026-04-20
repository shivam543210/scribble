const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/games/room/{roomId}/start:
 *   post:
 *     summary: Start the game in a room
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Game started }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.post('/room/:roomId/start', authMiddleware, gameController.startGame.bind(gameController));

module.exports = router;
