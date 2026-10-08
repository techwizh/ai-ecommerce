const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const protect = require("../middleware/auth");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", protect, getMe);

module.exports = router;