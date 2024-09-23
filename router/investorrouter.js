const router = require("express").Router();

const {
  searchEntrepreneursByName,
  editProfile,
  getCurrentUser,
  deleteUser,
  getAllentrepreneurs,
  getEntrepreneurById,
  sendMessageToEntrepreneur,
  getMessagesWithEntrepreneur,
  getIdeas,
  likeIdea,
} = require("../controller/investorcontroller");
const { middleware } = require("../middleware/jwtmiddleware");

router.get("/currentuser", getCurrentUser);
router.patch("/editprofile", editProfile);
router.delete("/deleteuser", deleteUser);
router.get("/entrepreneurs", getAllentrepreneurs);
router.get("/entrepreneur/:id", getEntrepreneurById);
router.post(
  "/send-message/:entrepreneurId",
  middleware,
  sendMessageToEntrepreneur
);
router.get("/messages/:roomId", getMessagesWithEntrepreneur);
router.post("/search-entrepreneur", searchEntrepreneursByName);

router.get("/get-ideas/all", getIdeas);
router.post("/likeIdea", middleware, likeIdea);

module.exports = router;
