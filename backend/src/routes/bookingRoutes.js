const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createBooking, getMyBookings, cancelBooking } = require("../controllers/bookingController");

const router = express.Router();

router.use(protect);

router.post("/", createBooking);
router.get("/mine", getMyBookings);
router.delete("/:id", cancelBooking);

module.exports = router;
