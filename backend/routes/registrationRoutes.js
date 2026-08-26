const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getStudentRegistrations,
  getEventRegistrations,
  getAllRegistrations,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register/:eventId', protect, authorize('student'), registerForEvent);
router.delete('/:id', protect, authorize('student'), cancelRegistration);
router.get('/my-registrations', protect, authorize('student'), getStudentRegistrations);
router.get('/event/:eventId', protect, authorize('organizer'), getEventRegistrations);
router.get('/all', protect, authorize('organizer'), getAllRegistrations);

module.exports = router;
