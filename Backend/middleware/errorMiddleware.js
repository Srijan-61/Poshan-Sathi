/**
 * errorMiddleware.js
 * Global error handler that ensures every error thrown in the app
 * uniformly outputs the { success: false, message: ... } format.
 */
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = globalErrorHandler;
