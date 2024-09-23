const express = require("express");
const router = express.Router();
const videoController = require("../controller/videoController");
const walletController = require("../controller/walletController.js");
const { middleware } = require("../middleware/jwtmiddleware");

router.post("/recharge", middleware, walletController.recharge);
router.get("/history", middleware, walletController.getHistory);

module.exports = router;
