const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
  getDeletedEvents,
  approveRejectEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getEvents);

// Protected event listing routes
router.get('/deleted', protect, authorize('student', 'organizer'), getDeletedEvents);
router.get('/organizer/my-events', protect, authorize('organizer'), getOrganizerEvents);
router.post('/', protect, authorize('organizer'), createEvent);
router.put('/:id', protect, authorize('organizer'), updateEvent);
router.delete('/:id', protect, authorize('organizer'), deleteEvent);
router.patch('/:id/status', protect, authorize('organizer'), approveRejectEvent);

router.get('/:id', getEventById);

module.exports = router;
