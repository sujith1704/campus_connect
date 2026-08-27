const express = require('express');
const router = express.Router();
const { getPlatformStats } = require('../controllers/statsController');

// Public route to fetch platform statistics
router.get('/', getPlatformStats);

module.exports = router;
