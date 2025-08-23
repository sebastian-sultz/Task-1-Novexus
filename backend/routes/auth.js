const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes - no authentication required
router.post('/register', register);
router.post('/login', login);

// Protected route - requires authentication
router.get('/me', protect, getMe);

module.exports = router;