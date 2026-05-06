const cloudinary = require("cloudinary").v2;

// ✅ Load env FIRST (no custom path needed)
require("dotenv").config();

// ✅ Configure Cloudinary once
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// // ✅ Debug check (remove later if you want)
// console.log("Cloudinary Config Check:");
// console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

// ✅ Upload function
const uploadFromBuffer = (buffer, folder = "others") => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return reject(new Error("❌ Cloudinary env variables not loaded"));
    }

    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err) {
          console.error("❌ Upload Error:", err);
          return reject(err);
        }
        resolve(result.secure_url);
      })
      .end(buffer);
  });
};

module.exports = { cloudinary, uploadFromBuffer };