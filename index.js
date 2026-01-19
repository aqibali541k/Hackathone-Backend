const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { PORT, MONGODB_URL } = process.env;
const port = PORT || 8000;
const authRouter = require("./Routes/User");
const campaignRouter = require("./Routes/Campaign");
const donationRouter = require("./Routes/Donation");
const analyticsRouter = require("./Routes/Analytics");
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

const connectDB = async () => {
  await mongoose
    .connect(MONGODB_URL)
    .then((res) => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.log(error);
    });
};

connectDB();

// Routes

app.use("/users", authRouter);
app.use("/campaigns", campaignRouter);
app.use("/donations", donationRouter);
app.use("/analytics", analyticsRouter);

app.get("/", (req, res) => {
  res.send("server is online");
});

app.listen(port, () => {
  console.log(`Your server is online at http://localhost:${port}`);
});
