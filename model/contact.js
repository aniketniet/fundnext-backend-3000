const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
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
    type: {
      type: String,
      required: true,
      enum: ["genral", "service"],
    },
  },

  { timestamps: true } // Enable timestamps
);

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
