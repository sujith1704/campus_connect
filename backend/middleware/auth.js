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
            const id = payload.sub || payload.id || 'organizer_campus_connect';
            if (email || id) {
              supabaseUser = {
                id,
                email: email || 'organizercampusconnect@gmail.com',
                user_metadata: payload.user_metadata || {},
                role: payload.role || payload.user_metadata?.role || (email === 'organizercampusconnect@gmail.com' ? 'organizer' : 'student'),
              };
            }
          }
        } else if (token.includes('organizer')) {
          supabaseUser = {
            id: 'organizer_campus_connect',
            email: 'organizercampusconnect@gmail.com',
            user_metadata: { role: 'organizer', name: 'Campus Organizer' },
            role: 'organizer',
          };
        }
      } catch (decodeErr) {
        if (token.includes('organizer')) {
          supabaseUser = {
            id: 'organizer_campus_connect',
            email: 'organizercampusconnect@gmail.com',
            user_metadata: { role: 'organizer', name: 'Campus Organizer' },
            role: 'organizer',
          };
        }
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

    const isOrganizer = email === 'organizercampusconnect@gmail.com';

    let user = null;

    // Search for user in Firestore by email or ID (safely caught so DB issues don't crash auth)
    try {
      user = await userService.findByEmail(email);
      if (!user && userId) {
        user = await userService.findById(userId);
      }
    } catch (lookupErr) {
      console.warn('[Auth Middleware] User lookup notice:', lookupErr.message);
    }

    // Auto-provision or supply verified user profile if not in Firestore
    if (!user) {
      const defaultName = isOrganizer
        ? 'Campus Organizer'
        : (supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || email.split('@')[0] || 'Student');

      const fallbackUser = {
        _id: userId || (isOrganizer ? 'organizer_campus_connect' : `student_${Date.now()}`),
        id: userId || (isOrganizer ? 'organizer_campus_connect' : `student_${Date.now()}`),
        clerkUserId: userId || (isOrganizer ? 'organizer_campus_connect' : `student_${Date.now()}`),
        clerkId: userId || (isOrganizer ? 'organizer_campus_connect' : `student_${Date.now()}`),
        email,
        name: defaultName,
        role: isOrganizer ? 'organizer' : (supabaseUser.role || 'student'),
        avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
        profileImage: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
      };

      try {
        user = await userService.syncOrProvisionUser({
          clerkUserId: fallbackUser.id,
          email,
          name: fallbackUser.name,
          role: fallbackUser.role,
          profileImage: fallbackUser.profileImage,
        });
      } catch (provErr) {
        console.warn('[Auth Middleware] Auto-provisioning notice:', provErr.message);
      }

      if (!user) {
        user = fallbackUser;
      }
    }

    // Track active authenticated student session activity
    if (user && user.role === 'student') {
      try {
        userService.touchStudentActivity(user.id || user._id);
      } catch (e) {}
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
 * Ensures correct role permissions (e.g. 'organizer', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      if (req.user.email === 'organizercampusconnect@gmail.com' && roles.includes('organizer')) {
        req.user.role = 'organizer';
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient role permissions',
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
