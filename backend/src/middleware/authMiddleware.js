const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided. Please log in." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Basic role-based access control: requireRole("host") blocks guests
// from host-only actions (creating/editing listings, viewing the
// host dashboard) at the API level — not just hidden in the UI.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `This action requires one of these roles: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
}

module.exports = { protect, requireRole };
