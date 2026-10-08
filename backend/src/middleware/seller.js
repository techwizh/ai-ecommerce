// Use after the auth middleware: only seller accounts may continue
module.exports = (req, res, next) => {
  if (req.user?.role !== "seller") {
    return res.status(403).json({ message: "A seller account is required" });
  }
  next();
};