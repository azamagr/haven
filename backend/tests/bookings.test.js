jest.mock("../src/config/cloudinary", () => require("./__mocks__/cloudinary-config"));

const request = require("supertest");
const app = require("../src/app");
require("./setup");

async function createUser(role, suffix) {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({ name: `Test ${role}`, email: `${role}-${suffix}@example.com`, password: "password123", role });
  return { token: res.body.data.token, id: res.body.data.user.id };
}

async function createListing(hostToken, overrides = {}) {
  const req = request(app)
    .post("/api/listings")
    .set("Authorization", `Bearer ${hostToken}`)
    .field("title", overrides.title || "Test Listing")
    .field("description", "A perfectly nice place to stay for a few nights.")
    .field("location", "Skardu")
    .field("category", "Cottage")
    .field("pricePerNight", overrides.pricePerNight || 50)
    .field("maxGuests", overrides.maxGuests || 3)
    .field("photoAlt", "A cottage")
    .attach("photo", Buffer.from("fake-image-bytes"), "cottage.jpg");
  const res = await req;
  return res.body.data;
}

function dateInDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

describe("POST /api/bookings", () => {
  test("creates a booking with valid dates (happy path)", async () => {
    const host = await createUser("host", "1");
    const guest = await createUser("guest", "1");
    const listing = await createListing(host.token, { pricePerNight: 50 });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guest.token}`)
      .send({ listingId: listing._id, checkIn: dateInDays(5), checkOut: dateInDays(8), guests: 2 });

    expect(res.status).toBe(201);
    expect(res.body.data.totalPrice).toBe(150); // 3 nights * $50
    expect(res.body.data.status).toBe("confirmed");
  });

  test("rejects a booking that overlaps an existing confirmed booking (failure case)", async () => {
    const host = await createUser("host", "2");
    const guestA = await createUser("guest", "a");
    const guestB = await createUser("guest", "b");
    const listing = await createListing(host.token);

    await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestA.token}`)
      .send({ listingId: listing._id, checkIn: dateInDays(10), checkOut: dateInDays(14), guests: 1 });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestB.token}`)
      .send({ listingId: listing._id, checkIn: dateInDays(12), checkOut: dateInDays(16), guests: 1 });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already booked/i);
  });

  test("rejects a guest count above the listing's max (failure case)", async () => {
    const host = await createUser("host", "3");
    const guest = await createUser("guest", "3");
    const listing = await createListing(host.token, { maxGuests: 2 });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guest.token}`)
      .send({ listingId: listing._id, checkIn: dateInDays(5), checkOut: dateInDays(7), guests: 5 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/maximum/i);
  });

  test("rejects check-out on or before check-in (failure case)", async () => {
    const host = await createUser("host", "4");
    const guest = await createUser("guest", "4");
    const listing = await createListing(host.token);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guest.token}`)
      .send({ listingId: listing._id, checkIn: dateInDays(5), checkOut: dateInDays(5), guests: 1 });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/bookings/:id", () => {
  test("prevents cancelling someone else's booking (failure case)", async () => {
    const host = await createUser("host", "5");
    const guestA = await createUser("guest", "c");
    const guestB = await createUser("guest", "d");
    const listing = await createListing(host.token);

    const booking = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestA.token}`)
      .send({ listingId: listing._id, checkIn: dateInDays(20), checkOut: dateInDays(22), guests: 1 });

    const res = await request(app)
      .delete(`/api/bookings/${booking.body.data._id}`)
      .set("Authorization", `Bearer ${guestB.token}`);

    expect(res.status).toBe(403);
  });

  test("allows a guest to cancel their own booking (happy path)", async () => {
    const host = await createUser("host", "6");
    const guest = await createUser("guest", "e");
    const listing = await createListing(host.token);

    const booking = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guest.token}`)
      .send({ listingId: listing._id, checkIn: dateInDays(25), checkOut: dateInDays(27), guests: 1 });

    const res = await request(app)
      .delete(`/api/bookings/${booking.body.data._id}`)
      .set("Authorization", `Bearer ${guest.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("cancelled");
  });
});
