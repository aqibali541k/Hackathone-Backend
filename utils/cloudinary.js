const cloudinary = require("cloudinary").v2;
require('dotenv').config();

// Validate required environment variables
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn("⚠️ Cloudinary credentials missing from environment variables!");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadFromBuffer = (buffer, folder = "others") => {
  return new Promise((resolve, reject) => {
    if (!CLOUDINARY_CLOUD_NAME) {
      return reject(new Error("Cloudinary cloud_name is missing. Please check your environment variables."));
    }

    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err) {
          console.error("❌ Cloudinary Upload Stream Error:", err);
          reject(err);
        } else {
          resolve(result.secure_url);
        }
      })
      .end(buffer);
  });
};

module.exports = { cloudinary, uploadFromBuffer };
