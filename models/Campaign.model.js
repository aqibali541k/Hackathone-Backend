const mongoose = require("mongoose");
const campaignSchema = new mongoose.Schema({
  // Title of campaign
  title: { type: String, required: true },

  // Description about campaign
  description: { type: String, required: true },

  // Category (restricted to enum values)
  category: {
    type: String,
    enum: ["health", "education", "disaster", "others"],
    default: "others"
  },

  // Goal amount (target money)
  goalAmount: { type: Number, required: true },

  // Raised amount (donations collected)
  raisedAmount: { type: Number, default: 0 },

  // Who created the campaign (NGO / User reference)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Campaign status
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active"
  },

  // Time-related fields
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },

  // Record creation time
  createdAt: { type: Date, default: Date.now },
  // Campaign images (multiple)
  images: [{type: String, required: true}],

});
module.exports = mongoose.model("Campaign", campaignSchema);