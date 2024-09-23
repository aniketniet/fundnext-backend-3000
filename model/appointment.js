const mongoose = require("mongoose");
const consult = require("./consult");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  customerName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeslot: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: false,
  },
  consult_id: {
    type: String,
    required: true,
  },
  consultName: {
    type: String,
    required: true,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
