require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Listing = require("../src/models/Listing");
const Booking = require("../src/models/Booking");

function coverImage(seed) {
  return `https://picsum.photos/seed/${seed}/900/600`;
}

const DEMO_HOST = { name: "Amina Host", email: "host@haven.test", password: "password123", role: "host" };
const DEMO_GUEST = { name: "Bilal Guest", email: "guest@haven.test", password: "password123", role: "guest" };

const listingsData = [
  {
    title: "Sunlit Cabin by the Pines",
    description:
      "A cozy wooden cabin tucked into a pine forest, with a wraparound deck and a wood-burning stove for cold nights.",
    location: "Nathia Gali, Pakistan",
    category: "Cabin",
    pricePerNight: 85,
    maxGuests: 4,
    photo: { url: coverImage("cabin-pines"), publicId: "demo/cabin-pines", alt: "A wooden cabin surrounded by pine trees" },
  },
  {
    title: "Modern Loft in the City Center",
    description:
      "A bright, minimalist loft two minutes from the main bazaar, with floor-to-ceiling windows and fast wifi for remote work.",
    location: "Lahore, Pakistan",
    category: "Apartment",
    pricePerNight: 60,
    maxGuests: 2,
    photo: { url: coverImage("city-loft"), publicId: "demo/city-loft", alt: "A modern apartment interior with large windows" },
  },
  {
    title: "Hillside Villa with Valley Views",
    description:
      "A spacious villa perched on a hillside with uninterrupted views of the valley below, a private garden, and a large terrace.",
    location: "Murree, Pakistan",
    category: "Villa",
    pricePerNight: 150,
    maxGuests: 8,
    photo: { url: coverImage("hillside-villa"), publicId: "demo/hillside-villa", alt: "A large villa on a hillside overlooking a green valley" },
  },
  {
    title: "Compact Studio Near the University",
    description: "A tidy, affordable studio a short walk from campus — ideal for a quiet weekend stay.",
    location: "Islamabad, Pakistan",
    category: "Studio",
    pricePerNight: 35,
    maxGuests: 1,
    photo: { url: coverImage("studio-uni"), publicId: "demo/studio-uni", alt: "A small, tidy studio apartment with a single bed" },
  },
  {
    title: "Riverside Cottage with a Private Dock",
    description: "A quiet cottage right on the riverbank, with a private dock and a hammock strung between two trees.",
    location: "Skardu, Pakistan",
    category: "Cottage",
    pricePerNight: 70,
    maxGuests: 5,
    photo: { url: coverImage("riverside-cottage"), publicId: "demo/riverside-cottage", alt: "A small cottage beside a calm river with a wooden dock" },
  },
];

async function seed() {
  try {
    await connectDB();
    await Promise.all([Booking.deleteMany({}), Listing.deleteMany({}), User.deleteMany({})]);

    const host = await User.create(DEMO_HOST);
    const guest = await User.create(DEMO_GUEST);

    const listings = await Listing.insertMany(
      listingsData.map((l) => ({ ...l, host: host._id }))
    );

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 10);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    await Booking.create({
      listing: listings[0]._id,
      guest: guest._id,
      checkIn,
      checkOut,
      guests: 2,
      totalPrice: listings[0].pricePerNight * 3,
    });

    console.log(`Seeded 2 users, ${listings.length} listings, and 1 booking.`);
    console.log(`Host login: ${DEMO_HOST.email} / ${DEMO_HOST.password}`);
    console.log(`Guest login: ${DEMO_GUEST.email} / ${DEMO_GUEST.password}`);
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
