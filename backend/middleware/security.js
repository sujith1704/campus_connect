/**
 * Security headers middleware
 * Configures protective HTTP headers without requiring external heavyweight packages.
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking by restricting framing
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict potentially sensitive browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Cross-Origin-Opener-Policy allows Google OAuth popups while isolating window
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Enforce HTTPS HSTS header in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

/**
 * Safe helper to escape regular expression special characters
 */
const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Helper to safely check if a string is a valid document ID
 */
const isValidId = (id) => {
  return typeof id === 'string' && id.trim().length > 0 && id.length <= 128 && !id.includes('/');
};

const isValidDocumentId = isValidId;

/**
 * Deep sanitization for objects/arrays to prevent NoSQL query injection
 * Strips keys beginning with '$' (e.g., $gt, $ne, $where) and strips null bytes.
 */
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    // Strip null byte characters
    return val.replace(/\0/g, '');
  }

  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }

  if (val !== null && typeof val === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(val)) {
      // Prevent operator injection in user-supplied objects
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeValue(val[key]);
    }
    return cleanObj;
  }

  return val;
};

/**
 * Middleware to sanitize req.body, req.query, and req.params against NoSQL injection
 */
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
};

module.exports = {
  securityHeaders,
  escapeRegex,
  isValidId,
  isValidDocumentId,
  sanitizeInput,
};
