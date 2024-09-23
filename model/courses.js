const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true,
  },
  thumnailUrl: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String, // Remove required: true to make it optional
  },
  cost: {
    type: Number,
    required: true,
  },
});

const Courses = mongoose.model("Courses", coursesSchema);
module.exports = Courses;
