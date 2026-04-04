const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  getProfile,
  updateProfile,
  updatePersonalInfo,
  updateDietPreferences,
  updateHealthConditions,
  updateActivityLevel,
  uploadProfileImage
} = require('../controllers/profileController');

const {
  updateHealthGoals,
  updateNutrientGoals,
  getDailyRequirements,
  recalculateRequirements
} = require('../controllers/goalsController');

// ----------------------------------------------------
// Profile Demographics (Static Data)
// ----------------------------------------------------
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/personal', protect, updatePersonalInfo);
router.put('/diet-preferences', protect, updateDietPreferences);
router.put('/health-conditions', protect, updateHealthConditions);
router.put('/activity-level', protect, updateActivityLevel);
router.put('/upload-image', protect, upload.single('image'), uploadProfileImage);

// ----------------------------------------------------
// Health Goals & Mathematical Targets
// ----------------------------------------------------
router.put('/health-goals', protect, updateHealthGoals);
router.put('/nutrient-goals', protect, updateNutrientGoals);
router.get('/daily-requirements', protect, getDailyRequirements);
router.post('/recalculate', protect, recalculateRequirements);

module.exports = router;