const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// POST /api/bookings
async function createBooking(req, res, next) {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    if (!listingId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ success: false, message: "Listing, dates, and guest count are all required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ success: false, message: "Check-in date can't be in the past" });
    }
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: "Check-out must be after check-in" });
    }
    if (Number(guests) > listing.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `This listing sleeps a maximum of ${listing.maxGuests} guests`,
      });
    }

    // Overlap check: block a new booking if any confirmed booking for this
    // listing shares any night with the requested range. This is the kind
    // of check that can only live on the server — it depends on data the
    // client can't see (every other guest's bookings).
    const overlapping = await Booking.findOne({
      listing: listingId,
      status: "confirmed",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });
    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: "This listing is already booked for part of those dates. Try a different range.",
      });
    }

    const totalPrice = nightsBetween(checkInDate, checkOutDate) * listing.pricePerNight;

    const booking = await Booking.create({
      listing: listingId,
      guest: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
    });

    const populated = await booking.populate("listing", "title location photo pricePerNight");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }
    next(err);
  }
}

// GET /api/bookings/mine
async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate("listing", "title location photo pricePerNight")
      .sort({ checkIn: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/bookings/:id — cancels (own booking only)
async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (String(booking.guest) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only cancel your own bookings" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }
    next(err);
  }
}

module.exports = { createBooking, getMyBookings, cancelBooking };
