const jwt = require('jsonwebtoken');
const User = require('../model/user');

exports.middleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "header is missing" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    const decoded = jwt.verify(token, 'aaaaaaaaaaaaabbbbbbbbbbbbbbbbbcccccccccccccccccccc');
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
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token is invalid' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
