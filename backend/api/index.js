const app = require("../src/app");
const connectDB = require("../src/config/db");

let connectionPromise = null;

module.exports = async (req, res) => {
  if (!connectionPromise) {
    connectionPromise = connectDB();
  }

  try {
    await connectionPromise;
  } catch (err) {
    connectionPromise = null;
    console.error("DB connection failed:", err.message);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: "Database connection failed" }));
    return;
  }

  return app(req, res);
};
