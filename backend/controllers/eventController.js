const eventService = require('../services/eventService');
const { isValidDocumentId } = require('../middleware/security');

// Valid event categories
const VALID_CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Gaming', 'Other'];

// Helper to validate image URLs
const isValidImageUrl = (url) => {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

// @desc    Get all events (Public: approved only; Admin/Organizer can pass status)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    const events = await eventService.getEvents({
      search,
      category,
      status,
    });

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
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const event = await eventService.getEventById(req.params.id);

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
// @access  Private (Organizer)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, maxParticipants, image } = req.body;

    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Validation
    const cleanTitle = String(title).trim();
    const cleanDesc = String(description).trim();
    const cleanVenue = String(venue).trim();
    const cleanDate = String(date).trim();
    const cleanTime = String(time).trim();

    if (cleanTitle.length === 0 || cleanTitle.length > 200) {
      return res.status(400).json({ success: false, message: 'Title must be between 1 and 200 characters' });
    }

    if (cleanDesc.length === 0 || cleanDesc.length > 5000) {
      return res.status(400).json({ success: false, message: 'Description must be between 1 and 5000 characters' });
    }

    const selectedCategory = VALID_CATEGORIES.includes(category) ? category : 'Technical';

    let validatedMaxParticipants = 1000;
    if (maxParticipants !== undefined) {
      const parsed = Number(maxParticipants);
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100000) {
        return res.status(400).json({ success: false, message: 'Max participants must be a positive number up to 100,000' });
      }
      validatedMaxParticipants = Math.floor(parsed);
    }

    let eventImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
    if (image && typeof image === 'string' && image.trim()) {
      if (!isValidImageUrl(image.trim())) {
        return res.status(400).json({ success: false, message: 'Image must be a valid HTTP or HTTPS URL' });
      }
      eventImage = image.trim();
    }

    const event = await eventService.createEvent(
      {
        title: cleanTitle,
        description: cleanDesc,
        category: selectedCategory,
        date: cleanDate,
        time: cleanTime,
        venue: cleanVenue,
        maxParticipants: validatedMaxParticipants,
        image: eventImage,
        status: 'approved',
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    console.error('createEvent error:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ success: false, message: isDev ? (error.message || 'Server Error') : 'Server error occurred while creating event' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer - own event only)
exports.updateEvent = async (req, res) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const event = await eventService.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.isDeleted) {
      return res.status(400).json({ success: false, message: 'Deleted events cannot be edited' });
    }

    // Strict Ownership Enforcement: Only the event creator can edit it
    const organizerId = typeof event.organizer === 'object' ? event.organizer._id || event.organizer.id : event.organizer;
    const currentUserId = req.user._id || req.user.id;
    if (String(organizerId) !== String(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    const { title, description, category, date, time, venue, maxParticipants, image, status } = req.body;
    const updates = {};

    if (title !== undefined) {
      const cleanTitle = String(title).trim();
      if (!cleanTitle || cleanTitle.length > 200) {
        return res.status(400).json({ success: false, message: 'Title must be between 1 and 200 characters' });
      }
      updates.title = cleanTitle;
    }

    if (description !== undefined) {
      const cleanDesc = String(description).trim();
      if (!cleanDesc || cleanDesc.length > 5000) {
        return res.status(400).json({ success: false, message: 'Description must be between 1 and 5000 characters' });
      }
      updates.description = cleanDesc;
    }

    if (category !== undefined && VALID_CATEGORIES.includes(category)) {
      updates.category = category;
    }

    if (date !== undefined) updates.date = String(date).trim();
    if (time !== undefined) updates.time = String(time).trim();
    if (venue !== undefined) updates.venue = String(venue).trim();

    if (maxParticipants !== undefined) {
      const parsed = Number(maxParticipants);
      if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100000) {
        return res.status(400).json({ success: false, message: 'Max participants must be a positive number' });
      }
      updates.maxParticipants = Math.floor(parsed);
    }

    if (image !== undefined && image !== '') {
      if (!isValidImageUrl(String(image).trim())) {
        return res.status(400).json({ success: false, message: 'Image must be a valid HTTP or HTTPS URL' });
      }
      updates.image = String(image).trim();
    }

    if (status !== undefined && ['approved', 'pending', 'rejected'].includes(status)) {
      updates.status = status;
    }

    const updatedEvent = await eventService.updateEvent(req.params.id, updates);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ success: false, message: isDev ? (error.message || 'Server Error') : 'Failed to update event' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer - own event only)
exports.deleteEvent = async (req, res) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const event = await eventService.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.isDeleted) {
      return res.status(400).json({ success: false, message: 'Event is already deleted' });
    }

    // Strict Ownership Enforcement: Only the event creator can delete their event
    const organizerId = typeof event.organizer === 'object' ? event.organizer._id || event.organizer.id : event.organizer;
    const currentUserId = req.user._id || req.user.id;
    if (String(organizerId) !== String(currentUserId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    const deleted = await eventService.deleteEvent(req.params.id, currentUserId);

    res.json({
      success: true,
      message: 'Event marked as deleted successfully',
      data: deleted,
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
    const currentUserId = req.user._id || req.user.id;
    const events = await eventService.getOrganizerEvents(currentUserId, req.query.scope, req.user);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('getOrganizerEvents error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get deleted events
// @route   GET /api/events/deleted
// @access  Private (Student, Organizer)
exports.getDeletedEvents = async (req, res) => {
  try {
    const events = await eventService.getDeletedEvents();

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
// @access  Private (Organizer supervisory action)
exports.approveRejectEvent = async (req, res) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const updated = await eventService.updateStatus(req.params.id, status);

    res.json({
      success: true,
      message: `Event status updated to '${status}'`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
