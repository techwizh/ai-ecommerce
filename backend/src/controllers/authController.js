const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  businessName: user.businessName,
});

exports.register = async (req, res) => {
  const { name, email, password, role, businessName } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // Only "customer" or "seller" can be chosen; nobody can sign up as anything else
  const isSeller = role === "seller";
  if (isSeller && !String(businessName || "").trim()) {
    return res.status(400).json({ message: "Business name is required for sellers" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: isSeller ? "seller" : "customer",
    businessName: isSeller ? String(businessName).trim() : "",
  });
  res.status(201).json({ token: signToken(user._id), user: userResponse(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ token: signToken(user._id), user: userResponse(user) });
};

exports.getMe = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};

// POST /api/auth/become-seller   body: { businessName }
exports.becomeSeller = async (req, res) => {
  const businessName = String(req.body.businessName || "").trim();
  if (!businessName) {
    return res.status(400).json({ message: "Business name is required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role: "seller", businessName },
    { new: true }
  );
  res.json({ user: userResponse(user) });
};