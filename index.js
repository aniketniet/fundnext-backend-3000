const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const https = require("https");
const fs = require("fs");

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
// Serve static files from the uploads directory
app.use("/uploads", express.static("uploads"));
// Use CORS middleware
app.use(cors());
// Use bodyParser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("pong");
});

// Define parent routers
app.use("/auth", auth);

app.use("/entrepreneur", entrepreneur);
app.use(middleware);
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

// SSL certificate setup
const privateKey = fs.readFileSync(
  "/home/ubuntu/ssl-certificates/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/home/ubuntu/ssl-certificates/cert.pem",
  "utf8"
);
const ca = fs.readFileSync("/home/ubuntu/ssl-certificates/chain.pem", "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);
const HTTPS_PORT = process.env.PORT_HTTPS || 5000;

// Create HTTP server and redirect to HTTPS
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});
const HTTP_PORT = process.env.PORT_HTTP || 6000;
const httpServer = http.createServer(httpApp);

// Start servers
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
});

httpServer.listen(HTTP_PORT, () => {
  console.log(
    `HTTP Server is running on port ${HTTP_PORT} and redirecting to HTTPS`
  );
});
