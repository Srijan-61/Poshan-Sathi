const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const nutritionCalculator = require('../utils/nutrition/index');

// @desc    Update health goals
const updateHealthGoals = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  const { primaryGoal, targetWeight, targetDate, weeklyWeightGoal } = req.body;
  user.profile.healthGoals = { ...user.profile.healthGoals.toObject(), primaryGoal, targetWeight, targetDate, weeklyWeightGoal };
  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Update nutrient tracking goals
const updateNutrientGoals = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  // Merge the goals object elegantly
  user.profile.nutrientGoals = { ...user.profile.nutrientGoals.toObject(), ...req.body };
  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Get daily requirements target
const getDailyRequirements = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({ success: true, data: user.dailyRequirements });
});

// @desc    Recalculate dynamic requirements using centralized Utility
const recalculateRequirements = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  // 1. Calculate raw mathematics in isolated utility helper
  const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);
  
  // 2. Apply Custom Targets overlay if they exist
  if (user.profile.nutrientGoals?.customTargets) {
    user.dailyRequirements = nutritionCalculator.applyCustomTargets(
      requirements, 
      user.profile.nutrientGoals.customTargets
    );
  } else {
    user.dailyRequirements = requirements;
  }

  await user.save();
  res.status(200).json({ success: true, data: user });
});

module.exports = {
  updateHealthGoals,
  updateNutrientGoals,
  getDailyRequirements,
  recalculateRequirements
};
