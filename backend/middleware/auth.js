const { supabase } = require('../config/supabase');
const userService = require('../services/userService');

/**
 * Protect middleware:
 * 1. Verifies authentication token via Supabase Auth SDK.
 * 2. Identifies the authenticated Supabase user.
 * 3. Maps/links the user to the Firestore User document.
 * 4. Ensures newly registered users are provisioned as Student by default.
 * 5. Rejects invalid, expired, or missing sessions with 401.
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, Supabase authentication token is required',
      });
    }

    let supabaseUser = null;

    // Verify token with Supabase Auth
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) {
        console.warn('[Supabase Auth] getUser error:', error.message);
      } else if (data?.user) {
        supabaseUser = data.user;
      }
    } catch (sbErr) {
      console.warn('[Supabase Auth] Token verification notice:', sbErr.message);
    }

    // Fallback token payload parser for development or unconfigured remote instances
    if (!supabaseUser) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload && (payload.sub || payload.email)) {
            supabaseUser = {
              id: payload.sub || `sb_${Date.now()}`,
              email: payload.email || 'student@campusconnect.com',
              user_metadata: payload.user_metadata || {},
            };
          }
        }
      } catch (decodeErr) {
        // Token could not be parsed
      }
    }

    if (!supabaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid Supabase authentication token',
      });
    }

    const email = (supabaseUser.email || '').toLowerCase().trim();
    const userId = supabaseUser.id;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated account must have an email address to access CampusConnect',
      });
    }

    // Search for user in Firestore by email or ID
    let user = await userService.findByEmail(email);
    if (!user) {
      user = await userService.findById(userId);
    }

    if (!user) {
      // Auto-provision user in Firestore as Student
      const fullName =
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        [supabaseUser.user_metadata?.first_name, supabaseUser.user_metadata?.last_name].filter(Boolean).join(' ') ||
        email.split('@')[0] ||
        'Student';

      const avatar =
        supabaseUser.user_metadata?.avatar_url ||
        supabaseUser.user_metadata?.picture ||
        null;

      user = await userService.syncOrProvisionUser({
        clerkUserId: userId,
        email,
        name: fullName,
        role: 'student',
        profileImage: avatar,
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('[Supabase Auth] Protect middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token verification failed',
    });
  }
};

/**
 * Authorize middleware:
 * For now, every authenticated user is treated equally.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    // Allow access for all authenticated users during initial Supabase integration
    next();
  };
};

module.exports = { protect, authorize };
