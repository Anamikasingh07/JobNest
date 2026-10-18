const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ensure functions exist before registering routes
const registerHandler = authController.register || authController.registerUser;
const loginHandler = authController.login || authController.loginUser;
const { getProfile, updateProfile } = authController;
const { protect } = require('../middleware/authMiddleware');

if (!registerHandler || !loginHandler) {
  console.error('CRITICAL AUTH ROUTE ERROR:', {
    register: !!registerHandler,
    login: !!loginHandler
  });
}

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
