const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Getting token and check if it's there
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  // 2. Verification token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check if user still exists
    // Database queries no longer return the password string since it was set to select: false
    req.user = await User.findById(decoded.id); 
    
    if (!req.user) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }
    
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401));
  }
});

// Assuming you had or need an admin middleware, keeping the standard approach
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new AppError('Not authorized as an admin', 403));
  }
};

module.exports = { protect, admin };