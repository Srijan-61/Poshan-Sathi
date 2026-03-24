// backend/controllers/profileController.js

const User = require('../models/User');
const nutritionCalculator = require('./nutritionCalculatorController');

const PROFILE_DEFAULTS = {
  name: '',
  age: undefined,
  gender: 'male',
  weight: undefined,
  height: undefined,
  activityLevel: 'moderatelyActive',
  dietType: 'nonVegetarian',
  monthlyBudget: undefined,
  healthConditions: [],
  healthGoals: {
    primaryGoal: 'maintainWeight',
    weeklyWeightGoal: 0.5
  },
  nutrientGoals: {}
};

const toNumberOrUndefined = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeProfileUpdates = (profile = {}) => {
  const normalized = { ...profile };
  const numericFields = ['age', 'weight', 'height', 'monthlyBudget'];

  numericFields.forEach((field) => {
    if (field in normalized) {
      normalized[field] = toNumberOrUndefined(normalized[field]);
    }
  });

  if (normalized.healthConditions) {
    const asArray = Array.isArray(normalized.healthConditions)
      ? normalized.healthConditions
      : [normalized.healthConditions];
    normalized.healthConditions = asArray.filter(Boolean);
  }

  return normalized;
};

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      profile: user.profile,
      dailyRequirements: user.dailyRequirements,
      isProfileComplete: user.isProfileComplete
    });
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Ensure profile exists for legacy users/documents.
    user.profile = {
      ...PROFILE_DEFAULTS,
      ...(user.profile?.toObject ? user.profile.toObject() : user.profile)
    };

    // Update profile fields
    if (updates.profile) {
      const normalizedProfile = normalizeProfileUpdates(updates.profile);
      Object.keys(normalizedProfile).forEach(key => {
        if (normalizedProfile[key] !== undefined) {
          if (key === 'healthGoals' && typeof normalizedProfile.healthGoals === 'object') {
            user.profile.healthGoals = {
              ...(user.profile.healthGoals?.toObject
                ? user.profile.healthGoals.toObject()
                : user.profile.healthGoals),
              ...normalizedProfile.healthGoals
            };
          } else {
            user.profile[key] = normalizedProfile[key];
          }
        }
      });
    }
    
    // Recalculate daily requirements
    const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);
    
    // Apply custom targets if provided
    if (user.profile.nutrientGoals?.customTargets) {
      const finalRequirements = nutritionCalculator.applyCustomTargets(
        requirements,
        user.profile.nutrientGoals.customTargets
      );
      user.dailyRequirements = finalRequirements;
    } else {
      user.dailyRequirements = requirements;
    }
    
    // Check profile completion
    user.checkProfileCompletion();
    user.profileUpdatedAt = new Date();
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user.profile,
      dailyRequirements: user.dailyRequirements,
      isProfileComplete: user.isProfileComplete
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update personal information
 * @route   PUT /api/profile/personal
 * @access  Private
 */
exports.updatePersonalInfo = async (req, res) => {
  try {
    const { name, age, gender, weight, height, dateOfBirth } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update personal info
    if (name) user.profile.name = name;
    if (age) user.profile.age = age;
    if (gender) user.profile.gender = gender;
    if (weight) user.profile.weight = weight;
    if (height) user.profile.height = height;
    if (dateOfBirth) user.profile.dateOfBirth = dateOfBirth;
    
    // Recalculate requirements
    const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);
    user.dailyRequirements = requirements;
    
    user.checkProfileCompletion();
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Personal information updated',
      profile: user.profile,
      dailyRequirements: user.dailyRequirements
    });
    
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personal information',
      error: error.message
    });
  }
};

/**
 * @desc    Update health goals
 * @route   PUT /api/profile/health-goals
 * @access  Private
 */
exports.updateHealthGoals = async (req, res) => {
  try {
    const { primaryGoal, targetWeight, targetDate, weeklyWeightGoal } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update health goals
    if (primaryGoal) user.profile.healthGoals.primaryGoal = primaryGoal;
    if (targetWeight) user.profile.healthGoals.targetWeight = targetWeight;
    if (targetDate) user.profile.healthGoals.targetDate = targetDate;
    if (weeklyWeightGoal) user.profile.healthGoals.weeklyWeightGoal = weeklyWeightGoal;
    
    // Recalculate requirements based on new goals
    const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);
    user.dailyRequirements = requirements;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Health goals updated',
      healthGoals: user.profile.healthGoals,
      dailyRequirements: user.dailyRequirements
    });
    
  } catch (error) {
    console.error('Error updating health goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health goals',
      error: error.message
    });
  }
};

/**
 * @desc    Update diet preferences
 * @route   PUT /api/profile/diet-preferences
 * @access  Private
 */
exports.updateDietPreferences = async (req, res) => {
  try {
    const { dietType, allergies, foodsToAvoid, favoriteFoods } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update diet preferences
    if (dietType) user.profile.dietType = dietType;
    if (allergies) user.profile.allergies = allergies;
    if (foodsToAvoid) user.profile.foodsToAvoid = foodsToAvoid;
    if (favoriteFoods) user.profile.favoriteFoods = favoriteFoods;
    
    // Recalculate micronutrients based on diet type
    const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);
    user.dailyRequirements = requirements;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Diet preferences updated',
      dietPreferences: {
        dietType: user.profile.dietType,
        allergies: user.profile.allergies,
        foodsToAvoid: user.profile.foodsToAvoid,
        favoriteFoods: user.profile.favoriteFoods
      },
      dailyRequirements: user.dailyRequirements
    });
    
  } catch (error) {
    console.error('Error updating diet preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diet preferences',
      error: error.message
    });
  }
};

/**
 * @desc    Update nutrient tracking goals
 * @route   PUT /api/profile/nutrient-goals
 * @access  Private
 */
exports.updateNutrientGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update nutrient goals
    if (req.body.trackProtein !== undefined) {
      user.profile.nutrientGoals.trackProtein = req.body.trackProtein;
    }
    if (req.body.trackCarbs !== undefined) {
      user.profile.nutrientGoals.trackCarbs = req.body.trackCarbs;
    }
    if (req.body.trackFats !== undefined) {
      user.profile.nutrientGoals.trackFats = req.body.trackFats;
    }
    if (req.body.trackFiber !== undefined) {
      user.profile.nutrientGoals.trackFiber = req.body.trackFiber;
    }
    if (req.body.trackSugar !== undefined) {
      user.profile.nutrientGoals.trackSugar = req.body.trackSugar;
    }
    if (req.body.trackSodium !== undefined) {
      user.profile.nutrientGoals.trackSodium = req.body.trackSodium;
    }
    if (req.body.trackIron !== undefined) {
      user.profile.nutrientGoals.trackIron = req.body.trackIron;
    }
    if (req.body.trackCalcium !== undefined) {
      user.profile.nutrientGoals.trackCalcium = req.body.trackCalcium;
    }
    if (req.body.trackVitaminD !== undefined) {
      user.profile.nutrientGoals.trackVitaminD = req.body.trackVitaminD;
    }
    if (req.body.trackVitaminB12 !== undefined) {
      user.profile.nutrientGoals.trackVitaminB12 = req.body.trackVitaminB12;
    }
    if (req.body.trackPotassium !== undefined) {
      user.profile.nutrientGoals.trackPotassium = req.body.trackPotassium;
    }
    
    // Update custom targets
    if (req.body.customTargets) {
      user.profile.nutrientGoals.customTargets = req.body.customTargets;
      
      // Recalculate with custom targets
      const baseRequirements = nutritionCalculator.calculateDailyRequirements(user.profile);
      const finalRequirements = nutritionCalculator.applyCustomTargets(
        baseRequirements,
        req.body.customTargets
      );
      user.dailyRequirements = finalRequirements;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Nutrient tracking goals updated',
      nutrientGoals: user.profile.nutrientGoals,
      dailyRequirements: user.dailyRequirements
    });
    
  } catch (error) {
    console.error('Error updating nutrient goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update nutrient goals',
      error: error.message
    });
  }
};

/**
 * @desc    Update health conditions
 * @route   PUT /api/profile/health-conditions
 * @access  Private
 */
exports.updateHealthConditions = async (req, res) => {
  try {
    const { healthConditions } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (healthConditions) {
      user.profile.healthConditions = healthConditions;
    }
    
    // Recalculate requirements based on health conditions
    const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);
    user.dailyRequirements = requirements;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Health conditions updated',
      healthConditions: user.profile.healthConditions,
      dailyRequirements: user.dailyRequirements
    });
    
  } catch (error) {
    console.error('Error updating health conditions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health conditions',
      error: error.message
    });
  }
};

/**
 * @desc    Update activity level
 * @route   PUT /api/profile/activity-level
 * @access  Private
 */
exports.updateActivityLevel = async (req, res) => {
  try {
    const { activityLevel } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (activityLevel) {
      user.profile.activityLevel = activityLevel;
    }
    
    // Recalculate TDEE based on new activity level
    const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);
    user.dailyRequirements = requirements;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Activity level updated',
      activityLevel: user.profile.activityLevel,
      dailyRequirements: user.dailyRequirements
    });
    
  } catch (error) {
    console.error('Error updating activity level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity level',
      error: error.message
    });
  }
};

/**
 * @desc    Update budget settings
 * @route   PUT /api/profile/budget
 * @access  Private
 */
exports.updateBudget = async (req, res) => {
  try {
    const { monthlyBudget, budgetPriority } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (monthlyBudget !== undefined) {
      user.profile.monthlyBudget = monthlyBudget;
    }
    if (budgetPriority) {
      user.profile.budgetPriority = budgetPriority;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Budget settings updated',
      budget: {
        monthlyBudget: user.profile.monthlyBudget,
        budgetPriority: user.profile.budgetPriority,
        dailyBudget: user.profile.monthlyBudget / 30
      }
    });
    
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
      error: error.message
    });
  }
};

/**
 * @desc    Get daily requirements
 * @route   GET /api/profile/daily-requirements
 * @access  Private
 */
exports.getDailyRequirements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      dailyRequirements: user.dailyRequirements,
      trackedNutrients: user.profile.nutrientGoals
    });
    
  } catch (error) {
    console.error('Error fetching requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily requirements',
      error: error.message
    });
  }
};

/**
 * @desc    Recalculate daily requirements manually
 * @route   POST /api/profile/recalculate
 * @access  Private
 */
exports.recalculateRequirements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Recalculate
    const requirements = nutritionCalculator.calculateDailyRequirements(user.profile);
    
    // Apply custom targets if any
    if (user.profile.nutrientGoals?.customTargets) {
      const finalRequirements = nutritionCalculator.applyCustomTargets(
        requirements,
        user.profile.nutrientGoals.customTargets
      );
      user.dailyRequirements = finalRequirements;
    } else {
      user.dailyRequirements = requirements;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Daily requirements recalculated',
      dailyRequirements: user.dailyRequirements
    });
    
  } catch (error) {
    console.error('Error recalculating requirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate requirements',
      error: error.message
    });
  }
};