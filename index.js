const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");

dotenv.config();

// Importing routers and middleware
const auth = require("./router/authrouter");
const entrepreneur = require("./router/enterprenuerrouter");
const investor = require("./router/investorrouter");
const check = require("./router/checkrouter");
const businessIdea = require("./router/businessIdeaRoutes");
const appointments = require("./router/appointmentRoutes");
const Videos = require("./router/videoRoutes");
const Webinar = require("./router/webinarRoutes");
const FAQs = require("./router/faqsRoutes");
const { middleware } = require("./middleware/jwtmiddleware");
const Wallet = require("./router/walletRoutes");

// Initialize express app
const app = express();

// Use CORS middleware
app.use(cors());
// Use bodyParser middlewar
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("pong");
});

// Define parent routers
app.use("/auth", auth);
app.use(middleware);
app.use("/entrepreneur", entrepreneur);
app.use("/check", check);
app.use("/investor", investor);
app.use("/api", businessIdea);
app.use("/appointments", appointments);
app.use("/videos", Videos);
app.use("/webinars", Webinar);
app.use("/faqs", FAQs);
app.use("/wallet", Wallet);

// MongoDB connection
const dbURI =
  process.env.DBURI ||
  "mongodb+srv://Fundnest:8877446687@fundnest.lris2bh.mongodb.net/"; // MongoDB remote

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Connected to MongoDB Server");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
