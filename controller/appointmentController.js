const Appointment = require("../model/appointment");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_n5oTuMseyDclhS",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "eR0Agm0HEGChnUp5Oi1mqUWc",
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER || "indiaglobal0@gmail.com",
    pass: process.env.EMAIL_PASS || "icjp zmmc twyq yncd ",
  },
});

exports.createAppointment = async (req, res) => {
  try {
    const {
      customerName,
      date,
      timeslot,
      platform,
      amount,
      currency,
      consult_id,
      consultName,
      consultEmail,
    } = req.body;

    const userId = req.user._id;
    const userEmail = req.user.email;
    const myemail = process.env.MY_EMAIL || "indiaglobal@gmail.com";

    // Validate required fields
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount provided." });
    }

    if (!currency) {
      return res.status(400).json({ error: "Currency is required." });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paisa (e.g., 1000 for 10 INR)
      currency,
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create new appointment with Razorpay order ID
    const newAppointment = new Appointment({
      user: userId,
      customerName,
      date,
      timeslot,
      platform,
      razorpayOrderId: razorpayOrder.id,
      consult_id,
      consultName,
    });

    const savedAppointment = await newAppointment.save();

    // Email sending logic - made optional
    const sendEmails = async () => {
      // Check if emails are provided and valid
      if (userEmail && /\S+@\S+\.\S+/.test(userEmail)) {
        const userMailOptions = {
          from: myemail,
          to: userEmail,
          subject: "Appointment Confirmation",
          text: `Dear ${customerName},\n\nYour appointment with ${consultName} has been confirmed for ${date} at ${timeslot}.\n\nThank you for using our service.`,
        };

        try {
          await transporter.sendMail(userMailOptions);
        } catch (emailError) {
          console.error("Error sending user email:", emailError);
          // Continue without failing the appointment creation
        }
      }

      if (consultEmail && /\S+@\S+\.\S+/.test(consultEmail)) {
        const consultantMailOptions = {
          from: myemail,
          to: consultEmail,
          subject: "New Appointment Scheduled",
          text: `Dear ${consultName},\n\nA new appointment has been scheduled with ${customerName} for ${date} at ${timeslot}.\n\nPlease prepare accordingly.`,
        };

        try {
          await transporter.sendMail(consultantMailOptions);
        } catch (emailError) {
          console.error("Error sending consultant email:", emailError);
          // Continue without failing the appointment creation
        }
      }
    };

    await sendEmails();

    // Send response after appointment is handled
    res.status(201).json({
      message: "Appointment saved and emails sent (if provided).",
      appointment: savedAppointment,
      razorpayOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single appointment by ID
exports.getAppointmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an appointment by ID
exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { customerName, date, timeslot, platform } = req.body;
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { customerName, date, timeslot, platform },
      { new: true, runValidators: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an appointment by ID
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
