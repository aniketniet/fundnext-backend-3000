const router = require("express").Router();

const {
  sendInterest,
  getCurrentUser,
  editProfile,
  getAllInvestors,
  deleteentrepreneur,
  getInvestorById,
  sendMessageToInvestor,
  getMessagesWithInvestor,
  getMessagesByRoomId,
  getConsults,
  buyCourse,
  getCourses,
} = require("../controller/enterprenuercontroller");
const { middleware } = require("../middleware/jwtmiddleware");

router.get("/currentuser", middleware, getCurrentUser);
router.patch("/editprofile", middleware, editProfile);
router.delete("/deleteuser", deleteentrepreneur);
router.get("/investors", getAllInvestors);
router.get("/investor/:id", middleware, getInvestorById);
router.post("/send-message/:investorId", middleware, sendMessageToInvestor);
// router.get('/messages/:roomId', getMessagesWithInvestor);
router.get("/express-interest/:investorId", middleware, sendInterest); //send email notification

router.get("/:roomId", getMessagesByRoomId);

router.get("/consults/all", getConsults);

router.post("/buy-course", middleware, buyCourse);

router.get("/get-courses/all", middleware, getCourses);

module.exports = router;
