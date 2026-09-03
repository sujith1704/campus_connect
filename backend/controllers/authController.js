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
      if (password !== 'organizerpass' && password !== 'organizer123') {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      let organizerUser = await User.findOne({ email: cleanEmail }).select('+password');
      if (!organizerUser) {
        organizerUser = await User.create({
          name: 'sujith',
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

// @desc    Authenticate with Google Identity Services (OAuth2/OIDC)
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { credential, access_token } = req.body;

    if (!credential && !access_token) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication credential or access token is required.',
      });
    }

    let payload = null;

    // 1. Verify Google credential (ID token) or access token
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          payload = await verifyRes.json();
        } else {
          // Attempt verification with google-auth-library if available
          const { OAuth2Client } = require('google-auth-library');
          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
          const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          payload = ticket.getPayload();
        }
      } catch (tokenErr) {
        console.error('Google ID token verification failed:', tokenErr.message);
        return res.status(401).json({
          success: false,
          message: 'Google authentication failed: Invalid or expired ID token.',
        });
      }
    } else if (access_token) {
      try {
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!userinfoRes.ok) {
          throw new Error('Userinfo fetch failed');
        }
        payload = await userinfoRes.json();
      } catch (accErr) {
        console.error('Google access token verification failed:', accErr.message);
        return res.status(401).json({
          success: false,
          message: 'Google authentication failed: Invalid or expired access token.',
        });
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to retrieve verified email from Google identity.',
      });
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const name = payload.name || cleanEmail.split('@')[0];
    const avatar = payload.picture || null;

    // 2. Look up user by Google ID or registered email in MongoDB
    let user = await User.findOne({
      $or: [{ googleId }, { email: cleanEmail }],
    });

    // 3. Handle account authorization according to existing CampusConnect role system
    if (!user) {
      // Check if auto-registration for student accounts is enabled via environment variable
      if (process.env.ALLOW_GOOGLE_AUTO_REGISTER === 'true') {
        user = await User.create({
          name,
          email: cleanEmail,
          googleId,
          avatar,
          role: 'student', // strictly student role, never organizer
        });
      } else {
        return res.status(403).json({
          success: false,
          message: `No CampusConnect account found for ${cleanEmail}. Please sign in with an authorized campus account or contact your administrator.`,
        });
      }
    } else {
      // Link Google ID and avatar if not already set
      let needsSave = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        needsSave = true;
      }
      if (needsSave) {
        await user.save({ validateBeforeSave: false });
      }
    }

    // 4. Role Authorization check
    if (user.role === 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Admin accounts are no longer supported.',
      });
    }

    // 5. Issue standard CampusConnect JWT token
    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Google Auth Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during Google authentication.',
    });
  }
};
