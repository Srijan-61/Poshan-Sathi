// backend/routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  updatePersonalInfo,
  updateHealthGoals,
  updateDietPreferences,
  updateNutrientGoals,
  updateHealthConditions,
  updateActivityLevel,
  updateBudget,
  getDailyRequirements,
  recalculateRequirements,
  uploadProfileImage
} = require('../controllers/profileController');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', protect, getProfile);

// @route   PUT /api/profile
// @desc    Update complete profile
// @access  Private
router.put('/', protect, updateProfile);

// @route   PUT /api/profile/personal
// @desc    Update personal information
// @access  Private
router.put('/personal', protect, updatePersonalInfo);

// @route   PUT /api/profile/health-goals
// @desc    Update health goals
// @access  Private
router.put('/health-goals', protect, updateHealthGoals);

// @route   PUT /api/profile/diet-preferences
// @desc    Update diet preferences
// @access  Private
router.put('/diet-preferences', protect, updateDietPreferences);

// @route   PUT /api/profile/nutrient-goals
// @desc    Update nutrient tracking goals
// @access  Private
router.put('/nutrient-goals', protect, updateNutrientGoals);

// @route   PUT /api/profile/health-conditions
// @desc    Update health conditions
// @access  Private
router.put('/health-conditions', protect, updateHealthConditions);

// @route   PUT /api/profile/activity-level
// @desc    Update activity level
// @access  Private
router.put('/activity-level', protect, updateActivityLevel);

// @route   PUT /api/profile/budget
// @desc    Update budget settings
// @access  Private
router.put('/budget', protect, updateBudget);

// @route   GET /api/profile/daily-requirements
// @desc    Get daily nutritional requirements
// @access  Private
router.get('/daily-requirements', protect, getDailyRequirements);

// @route   POST /api/profile/recalculate
// @desc    Recalculate daily requirements
// @access  Private
router.post('/recalculate', protect, recalculateRequirements);

// @route   PUT /api/profile/upload-image
// @desc    Upload profile image
// @access  Private
router.put('/upload-image', protect, upload.single('image'), uploadProfileImage);

module.exports = router;