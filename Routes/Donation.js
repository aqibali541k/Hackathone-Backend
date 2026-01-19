// routes/donation.routes.js
const express = require("express");
const Donation = require("../models/Donation.model.js");
const Campaign = require("../models/Campaign.model.js");
const authMiddleware = require("../middlewares/token/verifyToken.js");
const upload = require("../middlewares/upload.js");

const donationRouter = express.Router();

// ✅ Create a donation
donationRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const { campaignId, amount } = req.body;

    if (!campaignId || !amount) {
      return res.status(400).json({ message: "Campaign and amount required" });
    }

    const donation = new Donation({
      campaign: campaignId,
      donor: req.user.id,
      amount,
    });

    await donation.save();

    // ✅ Update campaign raisedAmount
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { raisedAmount: amount },
    });

    res.status(201).json({ message: "Donation successful", donation });
  } catch (error) {
    res.status(500).json({
      message: "Server error creating donation",
      error: error.message,
    });
  }
});

// ✅ Get donations of a campaign (NGO/Admin only)
donationRouter.get("/campaign/:id", authMiddleware, async (req, res) => {
  try {
    const donations = await Donation.find({ campaign: req.params.id })
      .populate("donor", "firstName lastName email")
      .populate("campaign", "title");

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching donations",
      error: error.message,
    });
  }
});

module.exports = donationRouter;
