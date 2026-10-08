const express = require("express");
const { ask } = require("../controllers/assistantController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, ask);

module.exports = router;