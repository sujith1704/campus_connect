const express = require('express');
const router = express.Router();
const { getMe, syncUser, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Protected user profile & sync routes
router.get('/me', protect, getMe);
router.post('/sync', protect, syncUser);
router.post('/logout', protect, logout);

module.exports = router;


