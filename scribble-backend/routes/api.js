const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

/**
 * GET /api/rooms
 * Get all active rooms
 * Response: { success: boolean, rooms: Array }
 */
router.get('/rooms', roomController.getAllRooms.bind(roomController));

/**
 * GET /api/rooms/:roomId
 * Get specific room details
 * Params: { roomId: string }
 * Response: { success: boolean, room: Object }
 */
router.get('/rooms/:roomId', roomController.getRoomById.bind(roomController));

/**
 * GET /api/rooms/:roomId/exists
 * Check if room exists
 * Params: { roomId: string }
 * Response: { exists: boolean }
 */
router.get('/rooms/:roomId/exists', roomController.checkRoomExists.bind(roomController));

module.exports = router;
