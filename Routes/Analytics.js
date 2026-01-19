const mongoose = require("mongoose");
const express = require("express");
const Donation = require("../models/Donation.model.js");
const User = require("../models/auth.model.js");
const Campaign = require("../models/Campaign.model.js");

const authMiddleware = require("../middlewares/token/verifyToken.js");

const analyticsRouter = express.Router();

// 1️⃣ Monthly Donations & Donors
analyticsRouter.get("/donations", authMiddleware, async (req, res) => {
  try {
    const donations = await Donation.aggregate([
      {
        $group: {
          _id: { month: { $month: "$donatedAt" }, year: { $year: "$donatedAt" } },
          totalDonations: { $sum: "$amount" },
          totalDonors: { $addToSet: "$donor" }, // unique donors
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const result = donations.map(item => ({
      month: monthNames[item._id.month - 1] + " " + item._id.year,
      donations: item.totalDonations,
      donors: item.totalDonors.length, // unique donor count
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2️⃣ Donor Type Distribution (assuming User has a `type` field)
analyticsRouter.get("/donors", authMiddleware, async (req, res) => {
  try {
    const donorTypes = await Donation.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "donor",
          foreignField: "_id",
          as: "donorInfo"
        }
      },
      { $unwind: "$donorInfo" },
      {
        $group: {
          _id: "$donorInfo.type", // e.g., Individual, Corporate, NGO
          count: { $sum: 1 }
        }
      }
    ]);

    const result = donorTypes.map(item => ({
      name: item._id || "Unknown",
      value: item.count
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 3️⃣ Optional: Top Donors
analyticsRouter.get("/top-donors", authMiddleware, async (req, res) => {
  try {
    const topDonors = await Donation.aggregate([
      {
        $group: {
          _id: "$donor",
          totalDonated: { $sum: "$amount" }
        }
      },
      { $sort: { totalDonated: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "donorInfo"
        }
      },
      { $unwind: "$donorInfo" },
      {
        $project: {
          _id: 0,
          name: { $concat: ["$donorInfo.firstName", " ", "$donorInfo.lastName"] },
          email: "$donorInfo.email",
          totalDonated: 1
        }
      }
    ]);

    res.json(topDonors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = analyticsRouter;
