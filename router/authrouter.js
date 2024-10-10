const router = require("express").Router();

const {
  signup,
  login,
  logout,
  getMessagesByRoomId,
  sendOtp,
  verifyOtp,
  updatePassword,
  setContact,
} = require("../controller/authcontroller");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
// router.get('/user/:id', getUserById);
// router.put('/user/:id', updateUser);
// router.delete('/user/:id', deleteUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/update-password", updatePassword);

router.post("/setContact", setContact);

module.exports = router;
