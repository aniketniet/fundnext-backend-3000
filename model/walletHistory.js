const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const walletHistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: Number,
      enum: [0, 1],
      required: true,
    },
    discription: {
      type: String,
    },
  },
  { timestamps: true }
);

const walletHistory = mongoose.model("walletHistory", walletHistorySchema);

module.exports = walletHistory;
