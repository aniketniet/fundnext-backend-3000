const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    ideaPrice: {
      type: String,
      required: true,
    },
    profilePrice: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Enable timestamps
);

module.exports = mongoose.model("Price", priceSchema);
