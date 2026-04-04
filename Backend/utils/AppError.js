/**
 * AppError.js
 * Standardized error class for throwing predictable HTTP errors.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates it's a known error, not an unexpected crash

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
