const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/rooms/create:
 *   post:
 *     summary: Create a new game room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxPlayers: { type: integer, default: 6 }
 *               totalRounds: { type: integer, default: 3 }
 *     responses:
 *       201: { description: Room created }
 *       401: { description: Unauthorized }
 */
router.post('/create', authMiddleware, roomController.createRoom.bind(roomController));

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all active rooms
 *     tags: [Rooms]
 *     responses:
 *       200: { description: List of rooms }
 */
router.get('/', roomController.getAllRooms.bind(roomController));

/**
 * @swagger
 * /api/rooms/{roomId}:
 *   get:
 *     summary: Get specific room details
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Room details }
 */
router.get('/:roomId', roomController.getRoomById.bind(roomController));

/**
 * @swagger
 * /api/rooms/{roomId}/exists:
 *   get:
 *     summary: Check if room exists
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Whether the room exists }
 */
router.get('/:roomId/exists', roomController.checkRoomExists.bind(roomController));

module.exports = router;
