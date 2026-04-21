const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { deleteCloudinaryImage } = require('../utils/cloudinaryUtils');
const nutritionCalculator = require('../utils/nutrition/index');


const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({
    success: true,
    profile: user.profile,
    dailyRequirements: user.dailyRequirements || null
  });
});

// @desc    Update complete profile & auto-recalculate daily nutrition targets
const updateProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  // Merge incoming profile fields transparently
  user.profile = { ...user.profile.toObject(), ...(req.body.profile || {}) };

  // Auto-recalculate daily requirements from updated physical values
  try {
    const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);

    // Apply custom targets overlay if they exist
    if (user.profile.nutrientGoals?.customTargets) {
      user.dailyRequirements = nutritionCalculator.applyCustomTargets(
        requirements,
        user.profile.nutrientGoals.customTargets
      );
    } else {
      user.dailyRequirements = requirements;
    }
  } catch (calcErr) {
    // If profile is incomplete (missing age/weight/height), skip calculation
    console.warn('Nutrition calculation skipped:', calcErr.message);
  }

  user.profileUpdatedAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    profile: user.profile,
    dailyRequirements: user.dailyRequirements
  });
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

  const { dietType } = req.body;
  user.profile = { ...user.profile.toObject(), dietType };
  
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

  // multer-storage-cloudinary stores the URL in req.file.path
  const imageUrl = req.file.path || req.file.secure_url || req.file.url;
  user.profile.profileImage = imageUrl;
  await user.save();

  // Return profileImage at top level so frontend can read data.profileImage
  res.status(200).json({ success: true, profileImage: imageUrl });
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