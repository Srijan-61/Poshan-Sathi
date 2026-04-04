const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { deleteCloudinaryImage } = require('../utils/cloudinaryUtils');

// @desc    Get user profile (Basic Demographic Data)
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({ success: true, data: user });
});

// @desc    Update complete profile
const updateProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  // Merge incoming profile fields transparently
  user.profile = { ...user.profile.toObject(), ...(req.body.profile || {}) };
  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Update static personal information
const updatePersonalInfo = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  const { name, age, gender, weight, height, dateOfBirth } = req.body;
  user.profile = { ...user.profile.toObject(), name, age, gender, weight, height, dateOfBirth };
  
  await user.save();
  res.status(200).json({ success: true, data: user });
});

// @desc    Update static diet preferences
const updateDietPreferences = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  const { dietType, allergies, foodsToAvoid, favoriteFoods } = req.body;
  user.profile = { ...user.profile.toObject(), dietType, allergies, foodsToAvoid, favoriteFoods };
  
  await user.save();
  res.status(200).json({ success: true, data: user });
});

// @desc    Update static health conditions
const updateHealthConditions = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  if (req.body.healthConditions) {
    user.profile.healthConditions = req.body.healthConditions;
    await user.save();
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Update physical activity level
const updateActivityLevel = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  if (req.body.activityLevel) {
    user.profile.activityLevel = req.body.activityLevel;
    await user.save();
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Upload profile image to Cloudinary
const uploadProfileImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('Please upload an image', 400));

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  // Remove old image if existing
  if (user.profile.profileImage) {
    await deleteCloudinaryImage(user.profile.profileImage);
  }

  user.profile.profileImage = req.file.path || req.file.secure_url;
  await user.save();

  res.status(200).json({ success: true, data: user });
});

module.exports = {
  getProfile,
  updateProfile,
  updatePersonalInfo,
  updateDietPreferences,
  updateHealthConditions,
  updateActivityLevel,
  uploadProfileImage
};