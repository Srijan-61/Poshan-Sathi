//Standardized error class for throwing predictable HTTP errors.

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; 

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
