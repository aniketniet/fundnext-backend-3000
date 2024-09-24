const jwt = require("jsonwebtoken");
const User = require("../model/user");
require("dotenv").config();

exports.middleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Header is missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use an environment variable for the secret
    const { email, role } = decoded;

    if (!email) {
      return res.status(400).json({ message: "Email not found in token" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user information to the request object
    req.email = email;
    req.role = role;
    req.user = user;

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      console.log(err.message);
      return res.status(403).json({ message: "Token is invalid" });
    } else if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired" });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
