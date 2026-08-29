const express = require("express");
const multer = require("multer");
const { upload } = require("../middleware/upload");
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

const router = express.Router();

function handlePhotoUpload(req, res, next) {
  upload.single("photo")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Photo must be smaller than 4MB." });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}

// Public
router.get("/", getListings);

// Host-only (order matters: /mine must come before /:id)
router.get("/mine", protect, requireRole("host"), getMyListings);
router.post("/", protect, requireRole("host"), handlePhotoUpload, createListing);
router.put("/:id", protect, requireRole("host"), handlePhotoUpload, updateListing);
router.delete("/:id", protect, requireRole("host"), deleteListing);

// Public (must come after /mine so it doesn't swallow that route)
router.get("/:id", getListingById);

module.exports = router;
