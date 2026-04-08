const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all active rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: A list of active rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rooms:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/rooms', roomController.getAllRooms.bind(roomController));

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
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 room:
 *                   type: object
 */
router.get('/rooms/:roomId', roomController.getRoomById.bind(roomController));

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
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Whether the room exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 */
router.get('/rooms/:roomId/exists', roomController.checkRoomExists.bind(roomController));

module.exports = router;
