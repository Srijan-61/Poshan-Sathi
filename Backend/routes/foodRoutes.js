const express = require('express');
const router = express.Router();
const { getFoods, createCustomFood } = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFoods); // Protected route
router.post('/custom', protect, createCustomFood);

module.exports = router;