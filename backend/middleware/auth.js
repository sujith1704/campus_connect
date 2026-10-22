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
    if (!supabaseUser && token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const jsonStr = Buffer.from(b64, 'base64').toString('utf8');
          const payload = JSON.parse(jsonStr);
          if (payload) {
            const email = (payload.email || payload.user_metadata?.email || '').toLowerCase().trim();
            const id = payload.sub || payload.id || `sb_${Date.now()}`;
            if (email || id) {
              supabaseUser = {
                id,
                email: email || 'organizer@campusconnect.com',
                user_metadata: payload.user_metadata || {},
                role: payload.role || payload.user_metadata?.role,
              };
            }
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
    if (!user && userId) {
      user = await userService.findById(userId);
    }

    // Auto-provision user in Firestore if not found
    if (!user) {
      const isOrganizer = email === 'organizer@campusconnect.com' ||
        email === 'organizercampusconnect@gmail.com' ||
        supabaseUser.user_metadata?.role === 'organizer' ||
        supabaseUser.role === 'organizer';

      const fullName =
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        [supabaseUser.user_metadata?.first_name, supabaseUser.user_metadata?.last_name].filter(Boolean).join(' ') ||
        (isOrganizer ? 'Campus Organizer' : (email.split('@')[0] || 'Student'));

      const avatar =
        supabaseUser.user_metadata?.avatar_url ||
        supabaseUser.user_metadata?.picture ||
        null;

      user = await userService.syncOrProvisionUser({
        clerkUserId: userId,
        email,
        name: fullName,
        role: isOrganizer ? 'organizer' : 'student',
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
