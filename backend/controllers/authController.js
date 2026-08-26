const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026', {
    expiresIn: '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Name Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // 2. Email Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // 3. Password Validation (min 6 chars)
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // 4. Role Validation (only 'student' or 'organizer'; users cannot register as 'admin')
    let userRole = 'student';
    if (role === 'organizer') {
      userRole = 'organizer';
    }

    // 5. Check if email already registered in MongoDB
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // 6. Save user to MongoDB (password is hashed via bcryptjs pre('save') hook in User model)
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: userRole,
    });

    const token = generateToken(user._id);

    // 7. Return successful response
    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);

    // Handle MongoDB Duplicate Key Error (Code 11000)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Handle Mongoose Validation Errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    // Return exact error details in development
    return res.status(500).json({
      success: false,
      message: error.message || 'Database error occurred during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Special handling for Organizer Demo credentials: organizer@campusconnect.com / organizerpass
    if (cleanEmail === 'organizer@campusconnect.com') {
      if (password !== 'organizerpass') {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      let organizerUser = await User.findOne({ email: cleanEmail }).select('+password');
      if (!organizerUser) {
        organizerUser = await User.create({
          name: 'Organizer',
          email: 'organizer@campusconnect.com',
          password: 'organizerpass',
          role: 'organizer',
        });
      } else {
        const isMatch = await organizerUser.matchPassword(password);
        if (!isMatch) {
          organizerUser.password = 'organizerpass';
          await organizerUser.save();
        }
      }

      const token = generateToken(organizerUser._id);
      return res.json({
        success: true,
        token,
        user: {
          _id: organizerUser._id,
          name: organizerUser.name,
          email: organizerUser.email,
          role: organizerUser.role,
          createdAt: organizerUser.createdAt,
        },
      });
    }

    // Normal Registered Accounts (Student, etc.)
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check password match using bcryptjs
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.role === 'admin') {
      return res.status(401).json({ success: false, message: 'Admin accounts are no longer supported' });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Generate Password Reset Token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email address' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Development reset URL
    const resetUrl = `/reset-password/${resetToken}`;

    return res.status(200).json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetToken,
      resetUrl,
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Could not send reset password email' });
  }
};

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};
