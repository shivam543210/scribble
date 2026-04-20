const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const roomRoutes = require('./roomRoutes');

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);

module.exports = router;
