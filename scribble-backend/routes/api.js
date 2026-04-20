const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const roomRoutes = require('./roomRoutes');
const gameRoutes = require('./gameRoutes');

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/games', gameRoutes);

module.exports = router;
