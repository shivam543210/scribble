const socketIO = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { pubClient, subClient } = require('./redis');
const socketController = require('../controllers/socketController');

/**
 * Initializes Socket.IO with Express server
 * @param {http.Server} server - HTTP server instance created by Express
 * @returns {Server} Socket.IO server instance
 */
const initializeSocket = (server) => {
  // Creates Socket.IO server with CORS configuration
  // Options: { cors: { origin: string, methods: Array } }
  const io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Use Redis adapter for multi-instance scaling
  io.adapter(createAdapter(pubClient, subClient));

  // Authentication middleware for Sockets
  const { verifyToken } = require('../utils/jwt');
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  /**
   * Connection event handler
   */
  io.on('connection', (socket) => {
    // Join a private room named by userId for targeted emits (like sending words)
    socket.join(socket.userId);
    console.log(`User ${socket.userId} connected via socket ${socket.id}`);

    socketController.handleConnection(socket);
  });

  console.log('Socket.IO initialized with Auth');
  return io;
};

module.exports = initializeSocket;
