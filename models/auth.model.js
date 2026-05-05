const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  role: { type: String, enum: ["ngo", "donor", "admin"], default: "donor" },
  avatar: { type: String },
  resetToken: { type: String },
  tokenExpire: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
