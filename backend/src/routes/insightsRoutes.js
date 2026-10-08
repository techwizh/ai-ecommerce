const express = require("express");
const { getInsights } = require("../controllers/insightsController");
const protect = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getInsights);

module.exports = router;