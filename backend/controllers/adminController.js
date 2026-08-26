const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get dashboard statistics for Organizer Panel
// @route   GET /api/admin/stats
// @access  Private (Organizer)
exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments({ status: 'confirmed' });
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    const approvedEvents = await Event.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalOrganizers,
        totalEvents,
        totalRegistrations,
        pendingEvents,
        approvedEvents,
      },
    });
  } catch (error) {
    console.error('getOrganizerPanelStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Cleanup registrations or events
    if (user.role === 'student') {
      await Registration.deleteMany({ student: user._id });
    } else if (user.role === 'organizer') {
      const events = await Event.find({ organizer: user._id });
      const eventIds = events.map(e => e._id);
      await Registration.deleteMany({ event: { $in: eventIds } });
      await Event.deleteMany({ organizer: user._id });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User and associated data removed',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};
