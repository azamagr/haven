const mongoose = require("mongoose");

const CATEGORIES = ["Cabin", "Apartment", "Villa", "Studio", "Cottage"];

const listingSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [4, "Title must be at least 4 characters"],
      maxlength: [100, "Title can't be longer than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description can't be longer than 2000 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: "Choose a valid category" },
      required: [true, "Category is required"],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [1, "Price must be at least $1"],
    },
    maxGuests: {
      type: Number,
      required: [true, "Max guests is required"],
      min: [1, "Must accommodate at least 1 guest"],
      max: [20, "Max guests can't exceed 20"],
    },
    photo: {
      url: { type: String, required: [true, "A photo is required"] },
      publicId: { type: String, required: true },
      alt: { type: String, required: [true, "Photo alt text is required"] },
    },
  },
  { timestamps: true }
);

listingSchema.index({ location: "text", title: "text" });

module.exports = mongoose.model("Listing", listingSchema);
module.exports.CATEGORIES = CATEGORIES;
