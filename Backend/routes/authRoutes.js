const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Password Reset Flow
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

module.exports = router;