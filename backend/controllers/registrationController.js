const registrationService = require('../services/registrationService');
const eventService = require('../services/eventService');
const { isValidDocumentId } = require('../middleware/security');

// @desc    Register student for an event
// @route   POST /api/registrations/register/:eventId
// @access  Private (Student)
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user._id || req.user.id;

    if (!isValidDocumentId(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // 1. Fetch Event
    const event = await eventService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.isDeleted) {
      return res.status(400).json({ success: false, message: 'This event has been deleted and is no longer available for registration.' });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot register for unapproved event' });
    }

    // 2. Check seat availability
    const maxParticipants = event.maxParticipants || 1000;
    const currentRegistered = event.registeredCount || 0;
    if (currentRegistered >= maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Registration full! No available seats remaining for this event.',
      });
    }

    // 3. Check for existing active registration
    const existingReg = await registrationService.findOne({
      student: studentId,
      event: eventId,
    });

    if (existingReg) {
      if (existingReg.status === 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'You are already registered for this event!',
        });
      } else {
        // Re-activate cancelled registration
        const updatedReg = await registrationService.updateStatus(existingReg.id, 'confirmed');

        // Increment event seat count
        await eventService.adjustRegisteredCount(eventId, 1);

        return res.status(200).json({
          success: true,
          message: 'Successfully re-registered for the event!',
          data: updatedReg,
        });
      }
    }

    // 4. Create registration record
    const registration = await registrationService.createRegistration({
      studentId,
      eventId,
    });

    // 5. Update event registeredCount
    await eventService.adjustRegisteredCount(eventId, 1);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Confirmation ticket generated.',
      data: registration,
    });
  } catch (error) {
    console.error('Registration error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ success: false, message: isDev ? (error.message || 'Server Error') : 'Server error occurred during event registration' });
  }
};

// @desc    Cancel an event registration
// @route   DELETE /api/registrations/:id
// @access  Private (Student - own registration only)
exports.cancelRegistration = async (req, res) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid registration ID' });
    }

    const registration = await registrationService.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Strict Ownership Enforcement: A student can only cancel their own registration
    const regStudentId = typeof registration.student === 'object' ? registration.student._id || registration.student.id : registration.student;
    const currentUserId = req.user._id || req.user.id;
    if (String(regStudentId) !== String(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this registration' });
    }

    const eventId = typeof registration.event === 'object' ? registration.event._id || registration.event.id : registration.event;
    const event = await eventService.getEventById(eventId);
    if (event && event.isDeleted) {
      return res.status(400).json({ success: false, message: 'This event has been deleted and registration can no longer be cancelled normally.' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Registration is already cancelled' });
    }

    // Update status to cancelled
    await registrationService.updateStatus(registration.id, 'cancelled');

    // Decrement event registered count safely
    if (eventId) {
      await eventService.adjustRegisteredCount(eventId, -1);
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get logged in student's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private (Student)
exports.getStudentRegistrations = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const registrations = await registrationService.getStudentRegistrations(studentId);

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('getStudentRegistrations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations' });
  }
};

// @desc    Get registered students for a specific event
// @route   GET /api/registrations/event/:eventId
// @access  Private (Organizer of the event)
exports.getEventRegistrations = async (req, res) => {
  try {
    if (!isValidDocumentId(req.params.eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const event = await eventService.getEventById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Strict Ownership Enforcement: Only the organizer who created the event can view attendee list
    const organizerId = typeof event.organizer === 'object' ? event.organizer._id || event.organizer.id : event.organizer;
    const currentUserId = req.user._id || req.user.id;
    if (String(organizerId) !== String(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view attendee list for this event' });
    }

    const registrations = await registrationService.getEventRegistrations(req.params.eventId);

    res.json({
      success: true,
      eventTitle: event.title,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch event attendees' });
  }
};

// @desc    Get all registrations in system
// @route   GET /api/registrations/all
// @access  Private (Organizer Panel)
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await registrationService.getAllRegistrations();

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch all registrations' });
  }
};
