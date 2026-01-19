const express = require("express");
const Campaign = require("../models/Campaign.model.js");
const authMiddleware = require("../middlewares/token/verifyToken.js");
const adminMiddleware = require("../middlewares/verifyAdmin.js");
const upload = require("../middlewares/upload.js");
const { cloudinary } = require("../utils/cloudinary.js");

const campaignRouter = express.Router();

/* ---------------- CLOUDINARY BUFFER UPLOAD ---------------- */
const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "campaigns" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
};

/* ---------------- GET ALL CAMPAIGNS ---------------- */
campaignRouter.get("/readall", async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate(
      "createdBy",
      "firstName lastName email",
    );
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- GET SINGLE CAMPAIGN ---------------- */
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
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- MY CAMPAIGNS ---------------- */
campaignRouter.get("/my-campaigns", authMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      createdBy: req.user.id,
    }).populate("createdBy", "firstName lastName email");

    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- CREATE CAMPAIGN ---------------- */
campaignRouter.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  upload.array("images"),
  async (req, res) => {
    try {
      const { title, description, goalAmount, startDate, endDate, category } =
        req.body;

      if (!title || !description || !goalAmount) {
        return res.status(400).json({
          message: "Title, description and goalAmount are required",
        });
      }

      // ✅ Upload images to Cloudinary using buffer
      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadFromBuffer(file.buffer)),
      );

      const campaign = await Campaign.create({
        title,
        description,
        goalAmount,
        category: category || "others",
        startDate: startDate || Date.now(),
        endDate,
        createdBy: req.user.id,
        images: uploadedImages,
      });

      res.status(201).json({
        message: "Campaign created successfully",
        campaign,
      });
    } catch (error) {
      console.error("🔥 Create campaign error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

/* ---------------- UPDATE CAMPAIGN ---------------- */
campaignRouter.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);

      if (!campaign)
        return res.status(404).json({ message: "Campaign not found" });

      if (campaign.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }

      Object.assign(campaign, req.body);
      await campaign.save();

      res.status(200).json({
        message: "Campaign updated successfully",
        campaign,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

/* ---------------- DELETE CAMPAIGN ---------------- */
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
        return res.status(403).json({ message: "Not authorized" });
      }

      await campaign.deleteOne();
      res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = campaignRouter;
