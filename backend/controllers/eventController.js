const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events (Public: approved only; Admin/Organizer can pass status)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    let query = { isDeleted: false };

    // Filter by status (Default to approved for public views)
    if (status) {
      query.status = status;
    } else {
      query.status = 'approved';
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by title, venue, or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('getEvents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch event details' });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, maxParticipants, image } = req.body;

    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Status: Admin creates approved events directly; Organizers create approved events by default for immediate testing
    const initialStatus = 'approved';

    const event = await Event.create({
      title,
      description,
      category: category || 'Technical',
      date,
      time,
      venue,
      maxParticipants: maxParticipants ? Number(maxParticipants) : 1000,
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      organizer: req.user._id,
      status: initialStatus,
    });

    const populatedEvent = await Event.findById(event._id).populate('organizer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent,
    });
  } catch (error) {
    console.error('createEvent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer - own event, Admin - any event)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.isDeleted) {
      return res.status(400).json({ success: false, message: 'Deleted events cannot be edited' });
    }

    // Check ownership or admin status
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'organizer') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    const { title, description, category, date, time, venue, maxParticipants, image, status } = req.body;

    // Update fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (venue !== undefined) event.venue = venue;
    if (maxParticipants !== undefined) event.maxParticipants = Number(maxParticipants);
    if (image !== undefined && image !== '') event.image = image;
    if (status !== undefined && req.user.role === 'organizer') event.status = status;

    await event.save();

    const updatedEvent = await Event.findById(event._id).populate('organizer', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer - own event, Admin - any event)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.isDeleted) {
      return res.status(400).json({ success: false, message: 'Event is already deleted' });
    }

    // Check ownership or admin status
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'organizer') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    event.isDeleted = true;
    event.deletedAt = new Date();
    event.deletedBy = req.user._id;
    await event.save();

    res.json({
      success: true,
      message: 'Event marked as deleted successfully',
      data: event,
    });
  } catch (error) {
    console.error('deleteEvent error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get events created by current organizer
// @route   GET /api/events/organizer/my-events
// @access  Private (Organizer)
exports.getOrganizerEvents = async (req, res) => {
  try {
    const query = req.query.scope === 'all' ? { isDeleted: false } : { organizer: req.user._id, isDeleted: false };
    const events = await Event.find(query).populate('organizer', 'name email').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get deleted events
// @route   GET /api/events/deleted
// @access  Private (Student, Organizer, Admin)
exports.getDeletedEvents = async (req, res) => {
  try {
    const query = { isDeleted: true };
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .populate('deletedBy', 'name email')
      .sort({ deletedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve or reject event
// @route   PATCH /api/events/:id/status
// @access  Private (Admin)
exports.approveRejectEvent = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.status = status;
    await event.save();

    res.json({
      success: true,
      message: `Event status updated to '${status}'`,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
