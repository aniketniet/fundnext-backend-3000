const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const nodemailer = require("nodemailer");
const Contact = require("../model/contact");
// const ChatMessage = require('../model/ChatMessage');

const SALT_ROUNDS = 10;
const SECRET_KEY = "aaaaaaaaaaaaabbbbbbbbbbbbbbbbbcccccccccccccccccccc";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER || "indiaglobal0@gmail.com",
    pass: process.env.EMAIL_PASS || "icjp zmmc twyq yncd ",
  },
});

//SignUp
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let isUserExist = false;
    try {
      const user = await User.findOne({ email });
      if (user) {
        isUserExist = true;
      }
    } catch (error) {
      console.log(error);
    }

    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    bcrypt.hash(password, SALT_ROUNDS, async (error, hash) => {
      if (error) {
        return res.status(400).json({ message: "Error hashing password" });
      }

      const user = new User({
        name,
        email,
        password: hash,
        role,
        date: new Date(),
      });

      await user.save();
      delete user.password;

      const token = jwt.sign(
        { email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: "7d" }
      );

      return res.status(200).json({ user, token, status: 200 });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", status: 500 });
  }
};
//Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", status: 400 });
    }

    user.password = undefined;
    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, {
      expiresIn: "7d",
    });

    return res.status(200).json({ user, token, status: 200 });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", status: 500 });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // Clear the token from cookies
    res.clearCookie("token");

    return res
      .status(200)
      .json({ message: "Logged out successfully", status: 200 });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", status: 500 });
  }
};

// // Get messages by room ID
// exports.getMessagesByRoomId = async (req, res) => {
//     const { roomId } = req.params;

//     try {
//         const messages = await ChatMessage.find({ roomId }).sort({ timestamp: 1 });

//         return res.status(200).send({ messages, status: 200 });
//     } catch (error) {
//         console.error('Error in getMessagesByRoomId:', error);
//         return res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", status: 400 });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000);
    console.log("otp generated");

    const updatedUserOtp = await User.findByIdAndUpdate(user._id, {
      otp,
      otpExpiry,
    });
    if (!updatedUserOtp) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("otp updated");

    const mailOptions = {
      from: "brandneers@gmail.com",
      to: email,
      subject: "Reset Password OTP",
      text: `Your otp is ${otp}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Error sending email: " + error.toString());
      }
      console.log("Email sent: " + info.response);
    });
    return res.status(200).json({
      user: email,
      otp: otp,
      otpExpiry: otpExpiry,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", status: 400 });
    }
    const validOtp = user.otp;
    if (otp !== validOtp) {
      return res.status(400).json({ message: "Invalid OTP", status: 400 });
    }

    const currentTime = new Date();
    if (currentTime > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired", status: 400 });
    }

    return res
      .status(200)
      .json({ message: "OTP verified successfully", status: 200 });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", status: 400 });
    }
    bcrypt.hash(password, SALT_ROUNDS, async (error, hash) => {
      if (error) {
        return res.status(400).json({ message: "Error hashing password" });
      }
      const updatedUser = await User.findByIdAndUpdate(user._id, {
        password: hash,
      });
      delete updatedUser.password;
      const token = jwt.sign(
        { email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: "7d" }
      );
      return res
        .status(200)
        .json({ user, token, message: "Password updated successfully" });
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.setContact = async (req, res) => {
  try {
    const { name, email, phone, message, type } = req.body;

    const contact = new Contact({
      name,
      email,
      phone,
      description: message,
      type,
    });
    await contact.save();
    return res
      .status(200)
      .json({ message: "Contact saved successfully", status: 200 });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
