const rateLimit = require("express-rate-limit");

// Only failed attempts count; a successful login does not use up the limit
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many failed login attempts. Please try again in 15 minutes.",
  },
});

// Stops bots from mass-creating accounts
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many accounts created from this device. Try again later.",
  },
});