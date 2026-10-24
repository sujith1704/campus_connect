const userService = require('../services/userService');
const eventService = require('../services/eventService');
const registrationService = require('../services/registrationService');
const { isValidDocumentId } = require('../middleware/security');

// @desc    Get dashboard statistics for Organizer Panel
// @route   GET /api/admin/stats
// @access  Private (Organizer)
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalOrganizers,
      totalEvents,
      totalRegistrations,
      pendingEvents,
      approvedEvents,
    ] = await Promise.all([
      userService.countRegisteredStudents(),
      userService.countOrganizers(),
      eventService.countEvents({ isDeleted: false }),
      registrationService.countRegistrations({ status: 'confirmed' }),
      eventService.countEvents({ status: 'pending', isDeleted: false }),
      eventService.countEvents({ status: 'approved', isDeleted: false }),
    ]);

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
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Organizer Panel)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await userService.getAllUsers(role);

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
// @access  Private (Organizer Panel)
exports.deleteUser = async (req, res) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await userService.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUserId = req.user._id || req.user.id;
    // Prevent deleting self
    if (String(user.id) === String(currentUserId)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Protect primary organizer account
    if (user.email === 'organizercampusconnect@gmail.com') {
      return res.status(403).json({ success: false, message: 'Primary organizer account cannot be deleted' });
    }

    // Cleanup registrations or events
    if (user.role === 'student') {
      await registrationService.deleteByStudent(user.id);
    } else if (user.role === 'organizer') {
      const events = await eventService.getOrganizerEvents(user.id, 'mine');
      const eventIds = events.map((e) => e.id);
      await registrationService.deleteByEventIds(eventIds);
      for (const eid of eventIds) {
        await eventService.deleteEvent(eid, currentUserId);
      }
    }

    await userService.deleteUser(user.id);

    res.json({
      success: true,
      message: 'User and associated data removed',
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// @desc    Update user role (e.g. promote Student to Organizer)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Organizer Panel)
exports.updateUserRole = async (req, res) => {
  try {
    if (!isValidDocumentId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const { role } = req.body;
    if (!role || !['student', 'organizer'].includes(role)) {
      return res.status(400).json({ success: false, message: "Valid role ('student' or 'organizer') is required" });
    }

    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect primary organizer account
    if (user.email === 'organizercampusconnect@gmail.com' && role !== 'organizer') {
      return res.status(403).json({ success: false, message: 'Primary organizer account role cannot be changed' });
    }

    // Disallow creating other organizers
    if (role === 'organizer' && user.email !== 'organizercampusconnect@gmail.com') {
      return res.status(403).json({ success: false, message: 'Only organizercampusconnect@gmail.com can be an organizer' });
    }

    const updatedUser = await userService.updateRole(user.id, role);

    res.json({
      success: true,
      message: `User role updated to '${role}'`,
      data: {
        _id: updatedUser.id,
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};
