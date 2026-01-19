const express = require("express");
const Campaign = require("../models/Campaign.model.js");
const authMiddleware = require("../middlewares/token/verifyToken.js");
const adminMiddleware = require("../middlewares/verifyAdmin.js");
const fs = require("fs");
const { upload: cloudUpload } = require("../utils/cloudinary.js");
// const upload = require("../middlewares/upload.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const campaignRouter = express.Router();

// ✅ GET all campaigns (public)
campaignRouter.get("/readall", async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate(
      "createdBy",
      "firstName lastName email",
    );
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching campaigns",
      error: error.message,
    });
  }
});

// ✅ GET single campaign by ID (public)
campaignRouter.get("/read/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName email",
    );
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching campaign",
      error: error.message,
    });
  }
});

// ✅ GET logged-in user's campaigns (NGO only)
campaignRouter.get("/my-campaigns", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user.id }).populate(
      "createdBy",
      "firstName lastName email",
    );

    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching your campaigns",
      error: error.message,
    });
  }
});

// ✅ POST create campaign (NGO/admin only)
campaignRouter.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  upload.array("images"),
  async (req, res) => {
    try {
      if (!req.user?.id)
        return res.status(401).json({ msg: "USER NOT LOGGED IN" });

      const { title, description, goalAmount, startDate, endDate, category } =
        req.body;

      if (!title || !description || !goalAmount)
        return res.status(400).json({
          message: "Title, description and goalAmount are required",
        });

      // 🟢 upload images to cloudinary
      const uploadedImages = [];

      const files = req.files;
      const uploadResult = await Promise.all(
        files.map(async (file) => {
          try {
            const result = await cloudUpload(file.buffer, {
              folder: "campaigns",
            });
            return result.secure_url;
          } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
          } finally {
            fs.unlinkSync(file.path); // Delete local file after upload attempt
          }
        }),
      );

      const campaign = await Campaign.create({
        title,
        description,
        goalAmount,
        category: category || "others",
        startDate: startDate || Date.now(),
        endDate,
        createdBy: req.user.id,
        images: uploadResult,
      });
      console.log("DB campaign", campaign);
      // await campaign.save();

      res.status(201).json({
        message: "Campaign created successfully",
        campaign,
      });
    } catch (error) {
      console.error("🔥 Error creating campaign:", error);
      res.status(500).json({
        message: "Server error creating campaign",
        error: error.message,
      });
    }
  },
);

// ✅ PUT update campaign (only NGO who created it or admin)
campaignRouter.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign)
        return res.status(404).json({ message: "Campaign not found" });

      // Allow update only if same user created it OR admin
      if (campaign.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this campaign" });
      }

      const {
        title,
        description,
        goalAmount,
        startDate,
        endDate,
        category,
        status,
      } = req.body;

      if (title) campaign.title = title;
      if (description) campaign.description = description;
      if (goalAmount) campaign.goalAmount = goalAmount;
      if (startDate) campaign.startDate = startDate;
      if (endDate) campaign.endDate = endDate;
      if (category) campaign.category = category;
      if (status) campaign.status = status;

      await campaign.save();
      res
        .status(200)
        .json({ message: "Campaign updated successfully", campaign });
    } catch (error) {
      res.status(500).json({
        message: "Server error updating campaign",
        error: error.message,
      });
    }
  },
);

// ✅ DELETE campaign (only NGO who created it or admin)
campaignRouter.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign)
        return res.status(404).json({ message: "Campaign not found" });

      if (campaign.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this campaign" });
      }

      await campaign.deleteOne();
      res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Server error deleting campaign",
        error: error.message,
      });
    }
  },
);

module.exports = campaignRouter;
