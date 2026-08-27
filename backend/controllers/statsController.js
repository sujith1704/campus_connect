const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get public platform statistics for Home page
// @route   GET /api/stats
// @access  Public
exports.getPlatformStats = async (req, res) => {
  try {
    // 1. College Events Hosted: valid active events
    const eventsHosted = await Event.countDocuments({ isDeleted: false, status: 'approved' });

    // 2. Active Student Registrations: confirmed registrations on active events
    const activeEvents = await Event.find({ isDeleted: false, status: 'approved' }).select('_id');
    const activeEventIds = activeEvents.map((e) => e._id);
    const activeRegistrations = await Registration.countDocuments({
      status: 'confirmed',
      event: { $in: activeEventIds },
    });

    // 3. Clubs & Organizers: count of registered organizer accounts
    const organizers = await User.countDocuments({ role: 'organizer' });

    // 4. Verified College Events: platform standard
    const verifiedEvents = 100;

    const statsData = {
      eventsHosted,
      activeRegistrations,
      organizers,
      verifiedEvents,
    };

    res.json({
      success: true,
      eventsHosted,
      activeRegistrations,
      organizers,
      verifiedEvents,
      data: statsData,
    });
  } catch (error) {
    console.error('getPlatformStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch platform statistics' });
  }
};
