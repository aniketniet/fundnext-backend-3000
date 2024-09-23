const User = require("../model/user");
const walletHistory = require("../model/walletHistory");

exports.recharge = async (req, res) => {
  try {
    // Destructure the amount from request body and user id from the request
    const { amount } = req.body;
    const userId = req.user.id;

    // Validate that the amount is a number
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount." });
    }

    // Find the user by ID and increment their wallet balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { wallet: amount } }, // Make sure to use the 'wallet' field for balance
      { new: true }
    );

    // Create a new wallet history record for the recharge
    const walletHistoryRecord = new walletHistory({
      userId: userId,
      type: 0,
      amount: amount,
      discription: "Recharge wallet",
    });

    await walletHistoryRecord.save();

    // If the user doesn't exist
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Send success response with the updated user
    res.json({
      success: true,
      message: "Wallet balance updated successfully.",
      walletBalance: user.wallet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await walletHistory.find({ userId: userId });
    res.json({ success: true, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
