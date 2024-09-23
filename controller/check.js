const User = require("../model/user");

//role from user
exports.getrole = async (req, res) => {
  const email = req.email;
  const role = req.role;
  try {
    const currentUser = await User.findOne({
      email: email,
      role: role,
    });
    if (!currentUser) {
      return res.status(400).send({ message: "User not found", status: 400 });
    }
    return res.status(200).send({
      role: currentUser.role,
      wallet: currentUser.wallet,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error, inside catch block",
      status: 500,
    });
  }
};
