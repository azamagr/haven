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

function newListingRequest(token) {
  return request(app)
    .post("/api/listings")
    .set("Authorization", `Bearer ${token}`)
    .field("title", "Cozy Mountain Cabin")
    .field("description", "A lovely, quiet cabin with a great view of the surrounding hills and forest.")
    .field("location", "Nathia Gali")
    .field("category", "Cabin")
    .field("pricePerNight", 80)
    .field("maxGuests", 4)
    .field("photoAlt", "A wooden cabin in the mountains")
    .attach("photo", Buffer.from("fake-image-bytes"), "cabin.jpg");
}

describe("GET /api/listings", () => {
  test("is public and returns an empty list initially", async () => {
    const res = await request(app).get("/api/listings");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe("POST /api/listings (RBAC + validation)", () => {
  test("creates a listing when authenticated as a host (happy path)", async () => {
    const { token } = await createUser("host", "1");
    const res = await newListingRequest(token);

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Cozy Mountain Cabin");
    expect(res.body.data.photo.url).toContain("fake.cloudinary.test");
  });

  test("rejects the request when no token is provided (failure case)", async () => {
    const res = await request(app).post("/api/listings").field("title", "No Auth");
    expect(res.status).toBe(401);
  });

  test("rejects a guest trying to create a listing — RBAC (failure case)", async () => {
    const { token } = await createUser("guest", "1");
    const res = await newListingRequest(token);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/host/i);
  });

  test("rejects a listing with no photo attached (failure case)", async () => {
    const { token } = await createUser("host", "2");
    const res = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "No Photo Listing")
      .field("description", "This request never attaches a photo file.")
      .field("location", "Lahore")
      .field("category", "Studio")
      .field("pricePerNight", 40)
      .field("maxGuests", 2);

    expect(res.status).toBe(400);
  });
});

describe("PUT/DELETE /api/listings/:id (ownership)", () => {
  test("prevents one host from deleting another host's listing (failure case)", async () => {
    const hostA = await createUser("host", "a");
    const hostB = await createUser("host", "b");
    const created = await newListingRequest(hostA.token);
    const listingId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/listings/${listingId}`)
      .set("Authorization", `Bearer ${hostB.token}`);

    expect(res.status).toBe(403);
  });

  test("allows a host to delete their own listing (happy path)", async () => {
    const host = await createUser("host", "owner");
    const created = await newListingRequest(host.token);
    const listingId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/listings/${listingId}`)
      .set("Authorization", `Bearer ${host.token}`);

    expect(res.status).toBe(200);

    const list = await request(app).get("/api/listings");
    expect(list.body.data).toHaveLength(0);
  });
});
