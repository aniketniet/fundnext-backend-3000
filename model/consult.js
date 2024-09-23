const mongoose = require("mongoose");

const consultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  skills: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.model("consult", consultSchema);
