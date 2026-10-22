const express = require('express');
const router = express.Router();
const { getMe, syncUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Protected user profile & sync routes
router.get('/me', protect, getMe);
router.post('/sync', protect, syncUser);

module.exports = router;


