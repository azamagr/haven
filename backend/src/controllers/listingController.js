const configureCloudinary = require("../config/cloudinary");
const Listing = require("../models/Listing");

function uploadBufferToCloudinary(buffer, options) {
  const cloudinary = configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// GET /api/listings — public, supports search + filters
async function getListings(req, res, next) {
  try {
    const { q, category, minPrice, maxPrice, guests } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (guests) filter.maxGuests = { $gte: Number(guests) };
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter).populate("host", "name").sort({ createdAt: -1 });
    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings/mine — host-only, their own listings for the dashboard
async function getMyListings(req, res, next) {
  try {
    const listings = await Listing.find({ host: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings/:id — public
async function getListingById(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id).populate("host", "name");
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, data: listing });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }
    next(err);
  }
}

// POST /api/listings — host only
async function createListing(req, res, next) {
  try {
    const { title, description, location, category, pricePerNight, maxGuests, photoAlt } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "A photo is required" });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "haven/listings",
      resource_type: "image",
    });

    const listing = await Listing.create({
      host: req.user._id,
      title,
      description,
      location,
      category,
      pricePerNight,
      maxGuests,
      photo: { url: result.secure_url, publicId: result.public_id, alt: photoAlt || title },
    });

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message });
    }
    next(err);
  }
}

// PUT /api/listings/:id — host only, own listing only
async function updateListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    if (String(listing.host) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only edit your own listings" });
    }

    const { title, description, location, category, pricePerNight, maxGuests, photoAlt } = req.body;
    Object.assign(listing, { title, description, location, category, pricePerNight, maxGuests });
    if (photoAlt) listing.photo.alt = photoAlt;

    if (req.file) {
      const cloudinary = configureCloudinary();
      await cloudinary.uploader.destroy(listing.photo.publicId);
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "haven/listings",
        resource_type: "image",
      });
      listing.photo.url = result.secure_url;
      listing.photo.publicId = result.public_id;
    }

    await listing.save();
    res.json({ success: true, data: listing });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message });
    }
    next(err);
  }
}

// DELETE /api/listings/:id — host only, own listing only
async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    if (String(listing.host) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only delete your own listings" });
    }

    const cloudinary = configureCloudinary();
    await cloudinary.uploader.destroy(listing.photo.publicId).catch(() => {});
    await listing.deleteOne();

    res.json({ success: true, data: listing });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid listing id" });
    }
    next(err);
  }
}

module.exports = { getListings, getMyListings, getListingById, createListing, updateListing, deleteListing };
