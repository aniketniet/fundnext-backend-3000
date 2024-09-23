const Business = require('../model/BusinessIdea');
const Razorpay = require('razorpay');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define where to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique name for each file
  }
});

// Initialize multer with storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
}).array('attachment', 5); // Handling multiple file uploads (max 5 files)

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: 'rzp_test_n5oTuMseyDclhS',
    key_secret: 'eR0Agm0HEGChnUp5Oi1mqUWc'
});

// Create a new webinar booking
const createBusinessIdea = async (req, res) => {
    try {
    
        // Create the webinar booking in the database
        // const newWebinar = new Business({ name, email, purposeOfBooking });
        // await newWebinar.save();

        // Create Razorpay order
        const paymentAmount = 1500; // Amount in the smallest currency unit (e.g., paise for INR)
        const currency = 'INR';
        const options = {
            amount: paymentAmount * 100, // amount in the smallest currency unit
            currency: currency,
            receipt: 1,
            payment_capture: 1 // auto capture
        };

        const order = await razorpay.orders.create(options);

        // Send the Razorpay order details to the client
        res.status(201).json({
            webinar: newWebinar,
            razorpayOrder: order
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// save business idea
// Controller for saving business idea
const saveBusinessIdea = async (req, res) => {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ error: 'File upload error: ' + err.message });
      }
  
      const userId = req.user._id;
  
      const { name, email, phone, company, goal, domain, content, qualification, payment_id } = req.body;
  
      // Map the uploaded files' paths to store in the DB
      const attachments = req.files.map(file => file.path);
  
      try {
        // Save business idea to the database
        const newBusinessIdea = new Business({
          user: userId,
          name,
          email,
          phone,
          company,
          goal,
          domain,
          content,
          qualification,
          attachments, // Store file paths in the attachments field
          payment_id
        });
  
        await newBusinessIdea.save();
        res.status(201).json({ message: 'Business idea saved successfully', businessIdea: newBusinessIdea });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  };





  const getBusinessIdeas = async (req, res) => {
    try {
        // Extract the authenticated user's ID from req.user
        const userId = req.user.id;

        // Find business ideas where the user matches the authenticated user's ID
        const businessIdeas = await Business.find({
            user: userId
        }).populate('user');  // Optional: populates user details

        // Respond with the found business ideas
        res.status(200).json(businessIdeas);
    } catch (error) {
        // Handle errors and respond with status 400
        res.status(400).json({ error: error.message });
    }
};


module.exports = {
  createBusinessIdea, saveBusinessIdea, getBusinessIdeas
};