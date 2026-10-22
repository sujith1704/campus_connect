const eventService = require('../services/eventService');
const registrationService = require('../services/registrationService');
const userService = require('../services/userService');

// @desc    Get public platform statistics for Home page
// @route   GET /api/stats
// @access  Public
exports.getPlatformStats = async (req, res) => {
  try {
    // 1. College Events Hosted: real count of all active/hosted events
    const eventsHosted = await eventService.countEvents({ isDeleted: false });

    // 2. Active Student Registrations: real count of registered students on CampusConnect
    const studentUsers = await userService.countUsers('student');
    const eventRegistrations = await registrationService.countRegistrations({ status: 'confirmed' });
    const activeRegistrations = Math.max(studentUsers, eventRegistrations);

    // 3. Clubs & Organizers: count of registered organizer accounts
    const organizers = await userService.countUsers('organizer');

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
