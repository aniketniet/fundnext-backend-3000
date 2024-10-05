const jwt = require("jsonwebtoken");
const User = require("../model/user"); // Adjust the path based on your project structure
const ChatMessage = require("../model/ChatMessage");
const Business = require("../model/BusinessIdea");
const nodemailer = require("nodemailer");
const Consult = require("../model/consult");
const Course = require("../model/courses");
const path = require("path");
const multer = require("multer");
const dotenv = require("dotenv");

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

// Load environment variables from .env file
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER || "indiaglobal0@gmail.com",
    pass: process.env.EMAIL_PASS || "icjp zmmc twyq yncd ",
  },
});

transporter.verify().then(console.log).catch(console.error);

//Edit Profile
// Express route for handling profile edit
exports.editProfile = async (req, res) => {
  // Image upload middleware
  upload.single("profile_picture")(req, res, async function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
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
      if (!currentUser || currentUser.role !== "entrepreneur") {
        return res.status(400).send({
          message: "entrepreneur not found or you are not an entrepreneur",
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
        console.log(req.file);
        const profilePictureUrl = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${req.file.filename}`;
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

//Get curent entrepreneur
exports.getCurrentUser = async (req, res) => {
  const email = req.email;
  const role = req.role;
  try {
    const currentUser = await User.findOne({ email: email, role: role });
    if (!currentUser || currentUser.role !== "entrepreneur") {
      return res.status(400).send({
        message: "User not found,  or you are not an entrepreneur",
        status: 400,
      });
    } else {
      const entrepreneurIdeas = await Business.find({ user: currentUser._id });
      return res
        .status(200)
        .send({ currentUser, entrepreneurIdeas, status: 200 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error, inside catch block",
      status: 500,
    });
  }
};

//Delete Current entrepreneur
exports.deleteentrepreneur = async (req, res) => {
  const email = req.email;
  const role = req.role;
  try {
    const currentUser = await User.findOne({ email: email, role: role });
    if (!currentUser || currentUser.role !== "entrepreneur") {
      return res.status(400).send({
        message: "User not found , or your are not an entrepreneur",
        status: 400,
      });
    }
    await currentUser.deleteOne({ email: email });
    return res
      .status(200)
      .send({ message: "User deleted successfully", status: 200 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error, inside catch block",
      status: 500,
    });
  }
};

//Get all list of Investors
exports.getAllInvestors = async (req, res) => {
  try {
    const investorsList = await User.find({ role: "investor" });
    if (!investorsList) {
      return res
        .status(400)
        .send({ message: "No investors found", status: 400 });
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

//Get Investor By ID
exports.getInvestorById = async (req, res) => {
  const { id } = req.params;

  try {
    const userId = req.user.id;

    const investor = await User.findOne({ _id: id, role: "investor" });

    const currentLoggedInUser = await User.findById(userId);

    if (!currentLoggedInUser.views.includes(investor.id)) {
      const balance = currentLoggedInUser.wallet;
      if (balance >= 10) {
        const newBalance = balance - 10;
        currentLoggedInUser.wallet = newBalance;
        currentLoggedInUser.views.push(investor.id);
        await currentLoggedInUser.save();
      } else {
        return res
          .status(400)
          .send({ message: "Insufficient balance", status: 400 });
      }
    }
    if (!investor) {
      return res
        .status(400)
        .send({ message: "Investor not found", status: 400 });
    }

    return res.status(200).send({ investor, status: 200 });
  } catch (error) {
    console.error("Error in getInvestorById:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Send message to an investor
exports.sendMessageToInvestor = async (req, res) => {
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
    console.error("Error in sendMessageToInvestor:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get messages with a specific investor
// exports.getMessagesWithInvestor = async (req, res) => {
//     const { investorId } = req.params;
//     const entrepreneurId = req.user._id;

//     try {
//         const messages = await ChatMessage.find({
//             $or: [
//                 { senderId: entrepreneurId, receiverId: investorId },
//                 { senderId: investorId, receiverId: entrepreneurId }
//             ]
//         }).sort({ timestamp: 1 });

//         return res.status(200).send({ messages, status: 200 });
//     } catch (error) {
//         console.error('Error in getMessagesWithInvestor:', error);
//         return res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };
// exports.getMessagesWithInvestor = async (req, res) => {
//     const { investorId } = req.params;
//     const entrepreneurId = req.user._id;

//     try {
//         const messages = await ChatMessage.find({
//             $or: [
//                 { senderId: entrepreneurId, receiverId: investorId },
//                 { senderId: investorId, receiverId: entrepreneurId }
//             ]
//         }).sort({ timestamp: 1 });

//         return res.status(200).send({ messages, status: 200 });
//     } catch (error) {
//         console.error('Error in getMessagesWithInvestor:', error);
//         return res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };

// Get messages by room ID
exports.getMessagesByRoomId = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await ChatMessage.find({ roomId }).sort({ timestamp: 1 });

    return res.status(200).send({ messages, status: 200 });
  } catch (error) {
    console.error("Error in getMessagesByRoomId:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.sendInterest = async (req, res) => {
  //get my details from middleware

  try {
    const entrepreneurId = req.user.name;
    const mailOptions = {
      from: "brandneers@gmail.com",
      to: req.user.email,
      subject: "Some interested in your profile",
      text: `You have a new form intrest: ` + entrepreneurId,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Error sending email: " + error.toString());
      }
      console.log("Email sent: " + info.response);
      res.status(200).send("Form data received and email sent successfully.");
    });
  } catch (error) {
    res.status(500).send("Error processing interest");
  }
};

exports.getConsults = async (req, res) => {
  try {
    // Fetch all consult records from the database
    const consults = await Consult.find();

    // Modify the consult data to split the skills string into an array
    const modifiedConsults = consults.map((consult) => ({
      ...consult._doc, // Spread the existing fields from the document
      skills: consult.skills.split(",").map((skill) => skill.trim()), // Convert skills string to array
    }));

    // Return the modified consult data in the response
    res.status(200).json({
      message: "All consults fetched successfully",
      consults: modifiedConsults, // Return the list of modified consults
    });
  } catch (error) {
    console.error("Error fetching consults:", error);
    res.status(500).json({
      message: "Error fetching consults",
      error: error.message,
    });
  }
};

exports.buyCourse = async (req, res) => {
  try {
    const { courseId } = req.body; // Get course ID from the request body
    const userId = req.user._id; // Get the authenticated user ID from middleware

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has already bought the course
    if (user.myCourses.includes(courseId)) {
      return res.status(400).json({ message: "Course already purchased" });
    }

    // Add the course to the user's myCourses array
    user.myCourses.push(courseId);

    // Save the updated user document
    await user.save();

    // Send success response
    return res.status(200).json({
      message: "Course purchased successfully",
      userCourses: user.myCourses,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const userId = req.user._id; // Get authenticated user ID from middleware

    // Find the user by ID to retrieve their myCourses array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    // Get the list of course IDs the user has purchased
    const courseIds = user.myCourses;

    // If no courses have been purchased, return an empty array
    if (courseIds.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No courses purchased",
        courses: [],
      });
    }

    // Fetch full course details from the Courses collection using the course IDs
    const courses = await Course.find({ _id: { $in: courseIds } });

    // Send the response with the list of purchased course details
    return res.status(200).json({
      status: "success",
      message: "Courses retrieved successfully",
      courses: courses,
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
