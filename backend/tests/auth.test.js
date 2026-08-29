const request = require("supertest");
const app = require("../src/app");
require("./setup");

describe("POST /api/auth/signup", () => {
  test("creates a new account with valid data (happy path)", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Test Host",
      email: "test-host@example.com",
      password: "password123",
      role: "host",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe("host");
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined(); // never leaked
  });

  test("defaults to the guest role when none is given", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Default Role", email: "default@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe("guest");
  });

  test("rejects a duplicate email (failure case)", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({ name: "First", email: "dupe@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Second", email: "dupe@example.com", password: "password123" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("rejects a password shorter than 8 characters (failure case)", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Short Pass", email: "short@example.com", password: "abc" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({ name: "Login Test", email: "login@example.com", password: "password123" });
  });

  test("logs in with correct credentials (happy path)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe("login@example.com");
  });

  test("rejects an incorrect password (failure case)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("rejects an email that doesn't exist (failure case)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
  });
});
