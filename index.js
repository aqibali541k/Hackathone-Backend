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

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URL, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected");
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Ensure DB is connected for every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

/* ---------------- ROUTES ---------------- */
app.use("/users", authRouter);
app.use("/campaigns", campaignRouter);
app.use("/donations", donationRouter);
app.use("/analytics", analyticsRouter);
app.use("/contact", contactRouter);

app.get("/", (req, res) => {
  res.send(" Donation Hub Server is Online");
});

/* ---------- EXPORT (NO app.listen) ---------- */
module.exports = app;
