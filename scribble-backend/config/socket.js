const socketIO = require('socket.io');
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

  /**
   * Connection event handler
   * Triggered when: Client connects via socket.io-client
   * Receives: socket instance with { id: string, handshake: Object, rooms: Set }
   */
  io.on('connection', (socket) => {
    socketController.handleConnection(socket);
  });

  console.log('Socket.IO initialized');
  return io;
};

module.exports = initializeSocket;
