const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const authRouter = require("./Routes/User");
const campaignRouter = require("./Routes/Campaign");
const donationRouter = require("./Routes/Donation");
const analyticsRouter = require("./Routes/Analytics");
const contactRouter = require("./Routes/Contact");

app.use(cors({ origin: "*" }));
app.use(express.json());

/* ---------------- MONGODB CONNECTION ---------------- */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URL)
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");
  return cached.conn;
}

// CONNECT DB IMMEDIATELY
connectDB().catch((err) => console.error("❌ MongoDB connection failed:", err));

/* ---------------- ROUTES ---------------- */
app.use("/users", authRouter);
app.use("/campaigns", campaignRouter);
app.use("/donations", donationRouter);
app.use("/analytics", analyticsRouter);
app.use("/contact", contactRouter);

app.get("/", (req, res) => {
  res.send("server is online");
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
