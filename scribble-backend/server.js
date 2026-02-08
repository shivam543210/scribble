require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const initializeSocket = require('./config/socket');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Create HTTP server
// Required for Socket.IO to attach to
const server = http.createServer(app);

// Initialize Socket.IO
// Returns: io instance with methods { on: Function, emit: Function, to: Function }
const io = initializeSocket(server);

// Middleware
// CORS middleware - Expects: origin header from client
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware - Parses: JSON request body into req.body object
app.use(express.json());

// URL-encoded parser - Parses: URL-encoded data into req.body object
app.use(express.urlencoded({ extended: true }));

// Health check route
// GET /health
// Response: { status: 'OK', timestamp: number }
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: Date.now()
  });
});

// API routes
// Mounts all /api routes from routes/api.js
app.use('/api', apiRoutes);

// 404 handler - Catches all unmatched routes
app.use(notFoundHandler);

// Error handler - Catches all errors from routes/middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS enabled for: ${process.env.CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
