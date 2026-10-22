const userService = require('../services/userService');

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private (Supabase authenticated)
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      user: {
        _id: user._id || user.id,
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student',
        avatar: user.avatar || user.profileImage,
        profileImage: user.profileImage || user.avatar,
        supabaseUid: user.supabaseUid || user.id,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Explicitly sync/refresh authenticated user profile
// @route   POST /api/auth/sync
// @access  Private (Supabase authenticated)
exports.syncUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      user: {
        _id: user._id || user.id,
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student',
        avatar: user.avatar || user.profileImage,
        profileImage: user.profileImage || user.avatar,
        supabaseUid: user.supabaseUid || user.id,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('syncUser error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};



