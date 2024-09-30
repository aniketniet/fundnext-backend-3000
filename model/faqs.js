const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    metaDiscription: {
      type: String,
    },
    metaTitle: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
  },
  { timestamps: true } // Enable timestamps
);

module.exports = mongoose.model("faq", faqSchema);
