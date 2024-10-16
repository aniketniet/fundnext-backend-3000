const jwt = require("jsonwebtoken");
const User = require("../model/user");
require("dotenv").config();

exports.middleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
      return res
        .status(401)
        .json({ message: "Authorization token format is invalid" });
    }

    const token = tokenParts[1];
    const secret =
      process.env.JWT_SECRET ||
      "aaaaaaaaaaaaabbbbbbbbbbbbbbbbbcccccccccccccccccccc";

    // Ensure JWT_SECRET is provided
    if (!secret) {
      throw new Error("JWT_SECRET is not set in the environment");
    }

    // Verify the token
    const decoded = jwt.verify(token, secret);
    const { email, role } = decoded;

    if (!email) {
      return res.status(400).json({ message: "Email not found in token" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user info to request object
    req.user = user; // You can access email and role from req.user object
    req.email = email; // Optional, but if you need just the email, keep this
    req.role = role; // Optional, same as above

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Token is invalid" });
    } else if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired" });
    }

    // Generic error handling
    console.error("Middleware error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
