const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const authRouter = require("./Routes/User");
const campaignRouter = require("./Routes/Campaign");
const donationRouter = require("./Routes/Donation");
const analyticsRouter = require("./Routes/Analytics");

app.use(cors({ origin: "*" }));
app.use(express.json());

/* ---------------- MONGODB CONNECTION ---------------- */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

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
connectDB();

/* ---------------- ROUTES ---------------- */
app.use("/users", authRouter);
app.use("/campaigns", campaignRouter);
app.use("/donations", donationRouter);
app.use("/analytics", analyticsRouter);

app.get("/", (req, res) => {
  res.send("server is online");
});

module.exports = app;
