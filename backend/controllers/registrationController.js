const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Register student for an event
// @route   POST /api/registrations/register/:eventId
// @access  Private (Student)
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user._id;

    // 1. Fetch Event
    const event = await Event.findById(eventId);
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
    if (event.registeredCount >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Registration full! No available seats remaining for this event.',
      });
    }

    // 3. Check for existing active registration
    const existingReg = await Registration.findOne({
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
        existingReg.status = 'confirmed';
        existingReg.registeredAt = new Date();
        await existingReg.save();

        // Increment event seat count
        event.registeredCount += 1;
        await event.save();

        const populatedReg = await Registration.findById(existingReg._id).populate('event');

        return res.status(200).json({
          success: true,
          message: 'Successfully re-registered for the event!',
          data: populatedReg,
        });
      }
    }

    // 4. Create registration record
    const registration = await Registration.create({
      student: studentId,
      event: eventId,
      status: 'confirmed',
    });

    // 5. Update event registeredCount
    event.registeredCount += 1;
    await event.save();

    const populatedReg = await Registration.findById(registration._id).populate('event');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Confirmation ticket generated.',
      data: populatedReg,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already registered for this event' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server Error during registration' });
  }
};

// @desc    Cancel an event registration
// @route   DELETE /api/registrations/:id
// @access  Private (Student - own registration, Admin)
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Verify ownership
    if (registration.student.toString() !== req.user._id.toString() && req.user.role !== 'organizer') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this registration' });
    }

    const event = await Event.findById(registration.event);
    if (event && event.isDeleted) {
      return res.status(400).json({ success: false, message: 'This event has been deleted and registration can no longer be cancelled normally.' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Registration is already cancelled' });
    }

    // Update status to cancelled
    registration.status = 'cancelled';
    await registration.save();

    // Decrement event registered count safely
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
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
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name email' },
      })
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch registrations' });
  }
};

// @desc    Get registered students for a specific event
// @route   GET /api/registrations/event/:eventId
// @access  Private (Organizer of the event, Admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check organizer authorization
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'organizer') {
      return res.status(403).json({ success: false, message: 'Not authorized to view attendee list' });
    }

    const registrations = await Registration.find({
      event: req.params.eventId,
      status: 'confirmed',
    })
      .populate('student', 'name email createdAt')
      .sort({ registeredAt: -1 });

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
// @access  Private (Admin)
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('student', 'name email')
      .populate('event', 'title category date time venue')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch all registrations' });
  }
};
