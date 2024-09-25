const jwt = require("jsonwebtoken");
const User = require("../model/user"); // Adjust the path based on your project structure
const ChatMessage = require("../model/ChatMessage");
const Business = require("../model/BusinessIdea");
const walletHistory = require("../model/walletHistory");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Upload folder (make sure it exists)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`); // Create a unique file name
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png) are allowed."));
    }
  },
});

//Edit Profile// Edit Profile API
exports.editProfile = async (req, res) => {
  // Image upload middleware
  upload.single("profile_picture")(req, res, async function (err) {
    if (err) {
      return res.status(400).send({ message: err.message, status: 400 });
    }

    // Proceed with the rest of the logic after handling image upload
    const {
      name,
      newemail,
      companyname,
      designation,
      experience,
      educationdetails,
      description,
    } = req.body;
    const email = req.email;
    const role = req.role;

    try {
      // Find the current user based on email and role
      const currentUser = await User.findOne({ email, role });

      // Check if user exists and has the correct role
      if (!currentUser || currentUser.role !== "investor") {
        return res.status(400).send({
          message: "Investor not found, or you are not an investor",
          status: 400,
        });
      }

      // Update user fields if provided
      if (name) currentUser.name = name;
      if (newemail && newemail !== currentUser.email) {
        // Check if new email already exists in the database
        const existingUser = await User.findOne({ email: newemail });
        if (existingUser) {
          return res
            .status(400)
            .send({ message: "Email already exists", status: 400 });
        }
        currentUser.email = newemail;
      }
      if (companyname) currentUser.companyname = companyname;
      if (designation) currentUser.designation = designation;
      if (experience) currentUser.experience = experience;
      if (educationdetails) currentUser.educationdetails = educationdetails;
      if (description) currentUser.description = description;

      // Handle profile picture if uploaded
      if (req.file) {
        const profilePictureUrl = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${req.file.filename}`; // Use the same folder as in the first API
        currentUser.profileImage = profilePictureUrl; // Save image URL in DB
      }

      // Save the updated user object
      await currentUser.save();

      // Generate JWT token with updated user email and role
      const token = jwt.sign(
        { email: currentUser.email, role: currentUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Return success response with updated user and token
      return res.status(200).send({ currentUser, token, status: 200 });
    } catch (error) {
      // Handle errors and log them
      console.error("Error in editProfile:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  });
};

//Get curent Investor
exports.getCurrentUser = async (req, res) => {
  const email = req.email;
  const role = req.role;
  try {
    const currentUser = await User.findOne({ email: email, role: role });
    if (!currentUser || currentUser.role !== "investor") {
      return res.status(400).send({
        message: "Investor not found,  or you are not an Investor",
        status: 400,
      });
    }
    return res.status(200).send({ currentUser, status: 200 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error, inside catch block",
      status: 500,
    });
  }
};

//Delete Investor
exports.deleteUser = async (req, res) => {
  const email = req.email;
  const role = req.role;
  try {
    const currentUser = await User.findOne({ email: email, role: role });
    if (!currentUser || currentUser.role !== "investor") {
      return res.status(400).send({
        message: "User not found , or your are not an investor",
        status: 400,
      });
    }
    await currentUser.deleteOne({ email: email });
    return res
      .status(200)
      .send({ message: "Investor deleted successfully", status: 200 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error, inside catch block",
      status: 500,
    });
  }
};

//Get all list of entrepreneurs
exports.getAllentrepreneurs = async (req, res) => {
  try {
    const investorsList = await User.find({ role: "entrepreneur" });
    if (!investorsList) {
      return res
        .status(400)
        .send({ message: "No entrepreneur found", status: 400 });
    }
    return res.status(200).send({ investorsList, status: 200 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error, inside catch block",
      status: 500,
    });
  }
};

// Get entrepreneur by ID

exports.getEntrepreneurById = async (req, res) => {
  const { id } = req.params;

  try {
    const userId = req.user.id;

    // Validate if the entrepreneur ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid entrepreneur ID", status: 400 });
    }

    // Find the logged-in user (should be an investor)
    const currentLoggedInUser = await User.findById(userId);
    if (!currentLoggedInUser) {
      return res
        .status(404)
        .json({ message: "Investor not found", status: 404 });
    }

    // Find the entrepreneur by ID and role
    const entrepreneur = await User.findOne({ _id: id, role: "entrepreneur" });
    if (!entrepreneur) {
      return res
        .status(404)
        .json({ message: "Entrepreneur not found", status: 404 });
    }

    // Check if the investor has already viewed the entrepreneur
    if (!currentLoggedInUser.views.includes(entrepreneur._id)) {
      const balance = currentLoggedInUser.wallet;
      if (balance >= 10) {
        // Deduct 10 from wallet balance
        const newBalance = balance - 10;
        currentLoggedInUser.wallet = newBalance;
        currentLoggedInUser.views.push(entrepreneur._id);
        await currentLoggedInUser.save();

        // Create a new WalletHistory record for the transaction
        const walletHistoryRecord = new walletHistory({
          userId: currentLoggedInUser._id,
          type: 1,
          amount: 10,
          discription: "View profile",
        });
        await walletHistoryRecord.save();
      } else {
        // Insufficient balance to view the entrepreneur
        return res
          .status(402)
          .json({ message: "Insufficient balance", status: 402 });
      }
    }

    // Find BusinessIdea records where the user field matches the entrepreneur's ID
    const entrepreneurIdeas = await Business.find({ user: entrepreneur._id });

    // Return entrepreneur info and business ideas
    return res.status(200).json({
      entrepreneur,
      entrepreneurIdeas,
      status: 200,
    });
  } catch (error) {
    console.error("Error in getEntrepreneurById:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Send message to an entrepreneur
exports.sendMessageToEntrepreneur = async (req, res) => {
  const { receiverId, message, roomId } = req.body;
  const senderId = req.user._id;

  try {
    const newMessage = new ChatMessage({
      senderId,
      receiverId,
      message,
      roomId,
    });

    await newMessage.save();
    return res
      .status(200)
      .send({ message: "Message sent successfully", status: 200 });
  } catch (error) {
    console.error("Error in sendMessageToEntrepreneur:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// search by entrepreneur name

exports.searchEntrepreneursByName = async (req, res) => {
  const { searchTerm } = req.body; // Extract searchTerm from req.body for POST requests

  if (!searchTerm || searchTerm.trim() === "") {
    return res.status(400).json({ message: "Search term is required" });
  }

  try {
    // Perform a case-insensitive search using regex, and exclude the password field
    const investorsList = await User.find({
      role: "entrepreneur",
      name: { $regex: searchTerm, $options: "i" }, // Case-insensitive search
    })
      .select("-password") // Exclude the password field
      .limit(10);

    return res.status(200).send({ investorsList, status: 200 });
  } catch (error) {
    console.error("Error in searchEntrepreneursByName:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get messages with a specific entrepreneur
exports.getMessagesWithEntrepreneur = async (req, res) => {
  const { entrepreneurId } = req.params;
  const investorId = req.user._id;

  try {
    const messages = await ChatMessage.find({
      $or: [
        { senderId: investorId, receiverId: entrepreneurId },
        { senderId: entrepreneurId, receiverId: investorId },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).send({ messages, status: 200 });
  } catch (error) {
    console.error("Error in getMessagesWithEntrepreneur:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// exports.getMessagesWithEntrepreneur = async (req, res) => {
//     const { entrepreneurId } = req.params;
//     const investorId = req.user._id;

//     try {
//         const messages = await ChatMessage.find({
//             $or: [
//                 { senderId: investorId, receiverId: entrepreneurId },
//                 { senderId: entrepreneurId, receiverId: investorId }
//             ]
//         }).sort({ timestamp: 1 });

//         return res.status(200).send({ messages, status: 200 });
//     } catch (error) {
//         console.error('Error in getMessagesWithEntrepreneur:', error);
//         return res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

exports.getIdeas = async (req, res) => {
  try {
    // Fetch all business ideas from the database, sorted by likeCount in descending order
    const ideas = await Business.find().sort({ likeCount: -1 });

    // Send the response with the ranked business ideas
    return res.status(200).json({
      status: "success",
      message: "Business ideas retrieved and ranked by likes successfully",
      ideas: ideas,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};
exports.likeIdea = async (req, res) => {
  try {
    const { ideaId } = req.body; // Get idea ID from request body
    const userId = req.user._id; // Get user ID from middleware (authenticated user)

    // Find the idea by ID
    const idea = await Business.findById(ideaId);
    if (!idea) {
      return res.status(404).json({
        status: "failed",
        message: "Business idea not found",
      });
    }

    // Log likedBy array and userId for debugging
    console.log("Liked by array:", idea.likedBy);
    console.log("User ID:", userId);

    // Check if the user has already liked the idea
    if (idea.likedBy.some((id) => id.equals(userId))) {
      return res.status(400).json({
        status: "failed",
        message: "You have already liked this idea",
      });
    }

    // Increment the like count and add the user to the likedBy array
    idea.likeCount += 1;
    idea.likedBy.push(userId);

    // Save the updated idea
    const savedIdea = await idea.save();

    // Log the saved idea for debugging
    console.log("Updated Idea:", savedIdea);

    // Send success response
    return res.status(200).json({
      status: "success",
      message: "Business idea liked successfully",
      likeCount: savedIdea.likeCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};
