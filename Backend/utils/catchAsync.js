/**
 * catchAsync.js
 * A simple wrapper to catch errors in Express async functions.
 * Eliminates the need for writing repetitive try/catch blocks.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
