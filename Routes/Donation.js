// routes/donation.routes.js
const express = require("express");
const Donation = require("../models/Donation.model.js");
const Campaign = require("../models/Campaign.model.js");
const authMiddleware = require("../middlewares/token/verifyToken.js");

const donationRouter = express.Router();

// ✅ Create a donation
donationRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const { campaignId, amount } = req.body;

    if (!campaignId || !amount) {
      return res.status(400).json({ message: "Campaign and amount required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
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

// ✅ Get logged-in user's donation history
donationRouter.get("/my-donations", authMiddleware, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate("campaign", "title images goalAmount raisedAmount status")
      .sort({ donatedAt: -1 });

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching donation history",
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
