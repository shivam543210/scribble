/**
 * Global error handler middleware
 * @param {Error} err - Error object with { message: string, stack: string }
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object with methods: { status: Function, json: Function }
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Sends: { success: false, error: string }
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};

/**
 * 404 Not Found handler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const notFoundHandler = (req, res) => {
  // Sends: { success: false, error: string }
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
