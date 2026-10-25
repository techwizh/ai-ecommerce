const rateLimit = require("express-rate-limit");

// Reject any request whose body or URL params contain MongoDB operators ($ne, $gt...)
// or dotted keys. Real users never send these.
const hasBadKey = (value) => {
  if (Array.isArray(value)) return value.some(hasBadKey);
  if (value && typeof value === "object") {
    return Object.keys(value).some(
      (key) => key.startsWith("$") || key.includes(".") || hasBadKey(value[key])
    );
  }
  return false;
};

exports.blockInjection = (req, res, next) => {
  if (hasBadKey(req.body) || hasBadKey(req.params)) {
    return res.status(400).json({ message: "Invalid input" });
  }
  next();
};

// Strip HTML from text that sellers and customers type, as a second layer behind React's escaping
exports.cleanText = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();

// General limit for the whole API, per IP
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});