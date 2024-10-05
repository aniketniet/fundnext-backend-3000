const Webinar = require("../model/webinar");
const Razorpay = require("razorpay");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_n5oTuMseyDclhS",
  key_secret: "eR0Agm0HEGChnUp5Oi1mqUWc",
});

// Create a new webinar booking
const createWebinar = async (req, res) => {
  try {
    const { name, email, purposeOfBooking } = req.body;

    // Create the webinar booking in the database
    const newWebinar = new Webinar({ name, email, purposeOfBooking });
    await newWebinar.save();

    // Create Razorpay order
    const paymentAmount = 1500; // Amount in the smallest currency unit (e.g., paise for INR)
    const currency = "INR";
    const options = {
      amount: paymentAmount * 100, // amount in the smallest currency unit
      currency: currency,
      receipt: `receipt_order_${newWebinar._id}`,
      payment_capture: 1, // auto capture
    };

    const order = await razorpay.orders.create(options);

    // Send the Razorpay order details to the client
    res.status(201).json({
      webinar: newWebinar,
      razorpayOrder: order,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all webinar bookings
const getAllWebinars = async (req, res) => {
  try {
    const webinars = await Webinar.find();
    res.status(200).json(webinars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single webinar booking by ID
const getWebinarById = async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) {
      return res.status(404).json({ error: "Webinar not found" });
    }
    res.status(200).json(webinar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a webinar booking by ID
const updateWebinar = async (req, res) => {
  try {
    const updatedWebinar = await Webinar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedWebinar) {
      return res.status(404).json({ error: "Webinar not found" });
    }
    res.status(200).json(updatedWebinar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a webinar booking by ID
const deleteWebinar = async (req, res) => {
  try {
    const deletedWebinar = await Webinar.findByIdAndDelete(req.params.id);
    if (!deletedWebinar) {
      return res.status(404).json({ error: "Webinar not found" });
    }
    res.status(200).json({ message: "Webinar deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createWebinar,
  getAllWebinars,
  getWebinarById,
  updateWebinar,
  deleteWebinar,
};
