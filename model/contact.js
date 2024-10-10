const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  description: {
    type: String, // Remove required: true to make it optional
  },
});

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
