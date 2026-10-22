/**
 * In-memory sliding-window rate limiter middleware.
 * Zero external dependencies; safe against memory leaks with automatic TTL cleanup.
 */
class MemoryRateLimiter {
  constructor(windowMs, maxRequests, message) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message || 'Too many requests from this IP, please try again later.';
    this.hits = new Map();

    // Clean up expired records every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, record] of this.hits.entries()) {
      if (now - record.startTime > this.windowMs) {
        this.hits.delete(ip);
      }
    }
  }

  getMiddleware() {
    return (req, res, next) => {
      // Determine client IP (handles standard reverse proxy X-Forwarded-For)
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = forwarded
        ? forwarded.split(',')[0].trim()
        : req.socket?.remoteAddress || req.ip || 'unknown';

      const now = Date.now();
      let record = this.hits.get(clientIp);

      if (!record || now - record.startTime > this.windowMs) {
        record = { count: 1, startTime: now };
        this.hits.set(clientIp, record);
      } else {
        record.count += 1;
      }

      const remaining = Math.max(0, this.maxRequests - record.count);
      const resetTime = Math.ceil((record.startTime + this.windowMs) / 1000);
      const retryAfterSeconds = Math.ceil((record.startTime + this.windowMs - now) / 1000);

      // Standard rate limit headers
      res.setHeader('RateLimit-Limit', this.maxRequests);
      res.setHeader('RateLimit-Remaining', remaining);
      res.setHeader('RateLimit-Reset', resetTime);

      if (record.count > this.maxRequests) {
        res.setHeader('Retry-After', retryAfterSeconds);
        return res.status(429).json({
          success: false,
          message: this.message,
          retryAfter: retryAfterSeconds,
        });
      }

      next();
    };
  }
}

// 25 requests per 15 minutes for authentication endpoints (login, register, forgot/reset password)
const authLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  25,
  'Too many authentication attempts from this IP address. Please try again in 15 minutes.'
).getMiddleware();

// 300 requests per 15 minutes for general API traffic
const apiLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  300,
  'API rate limit exceeded. Please throttle your requests.'
).getMiddleware();

module.exports = {
  authLimiter,
  apiLimiter,
};
