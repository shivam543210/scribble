const { verifyToken } = require('../utils/jwt');

/**
 * Authentication middleware to protect routes
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

module.exports = authMiddleware;
