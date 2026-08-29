const Listing = require("../models/Listing");
const Booking = require("../models/Booking");

// GET /api/dashboard — host only
async function getDashboard(req, res, next) {
  try {
    const listings = await Listing.find({ host: req.user._id }).select("_id title");
    const listingIds = listings.map((l) => l._id);

    if (listingIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalListings: 0,
          totalRevenue: 0,
          totalBookings: 0,
          bookingsByListing: [],
          revenueByMonth: [],
        },
      });
    }

    const [overview, bookingsByListing, revenueByMonth] = await Promise.all([
      Booking.aggregate([
        { $match: { listing: { $in: listingIds }, status: "confirmed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, totalBookings: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { listing: { $in: listingIds }, status: "confirmed" } },
        { $group: { _id: "$listing", count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { listing: { $in: listingIds }, status: "confirmed" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const titleById = new Map(listings.map((l) => [String(l._id), l.title]));

    res.json({
      success: true,
      data: {
        totalListings: listings.length,
        totalRevenue: overview[0]?.totalRevenue || 0,
        totalBookings: overview[0]?.totalBookings || 0,
        bookingsByListing: bookingsByListing.map((b) => ({
          title: titleById.get(String(b._id)) || "Deleted listing",
          count: b.count,
        })),
        revenueByMonth: revenueByMonth.map((r) => ({ month: r._id, revenue: r.revenue })),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
