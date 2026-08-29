const express = require("express");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", protect, requireRole("host"), getDashboard);

module.exports = router;
