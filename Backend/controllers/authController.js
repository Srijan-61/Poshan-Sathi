const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password, profile } = req.body;

  // 1. Validate required fields
  if (!name || !email || !password || !profile) {
    return next(new AppError('Please add all fields', 400));
  }

  // 2. Check if user already exists in the database
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists with that email', 400));
  }

  // 3. Mount the user's name securely into their profile object
  const userProfile = {
    ...profile,
    name
  };

  // 4. Create the new user in the database
  const user = await User.create({ 
    email, 
    password, 
    profile: userProfile 
  });

  if (!user) {
    return next(new AppError('Invalid user data received', 400));
  }

  // 5. Send Success Response with JWT Token
  res.status(201).json({
    success: true,
    data: {
      user: {
        _id: user.id, 
        name: user.profile?.name, 
        email: user.email, 
        role: user.role
      },
      token: user.generateAuthToken()
    }
  });
});

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Validate missing fields
  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 400));
  }

  // 2. Query database for user (Notice: .select('+password') exposes the hidden string)
  const user = await User.findOne({ email }).select('+password');

  // 3. Verify user exists AND entered password matches the database hash
  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // 4. Send Success Response with JWT Token
  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user.id, 
        name: user.profile?.name, 
        email: user.email, 
        role: user.role
      },
      token: user.generateAuthToken()
    }
  });
});

module.exports = { registerUser, loginUser };