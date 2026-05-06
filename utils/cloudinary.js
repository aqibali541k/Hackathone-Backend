const cloudinary = require("cloudinary").v2;
const path = require("path");

// Ensure dotenv is loaded from the correct path relative to this file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration will be attempted but we'll check dynamically in the function
// to allow for environment variables to be set later or via process.env
const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    return true;
  }
  return false;
};

const uploadFromBuffer = (buffer, folder = "others") => {
  return new Promise((resolve, reject) => {
    // Re-attempt config check in case variables were set after startup (e.g. in Vercel)
    const isConfigured = configureCloudinary();

    if (!isConfigured) {
      console.error("❌ Cloudinary Config Missing. Available Env Keys:", Object.keys(process.env).filter(k => k.startsWith('CLOUDINARY')));
      return reject(new Error("Cloudinary cloud_name is missing. If you are on Vercel, please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your project environment variables."));
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

configureCloudinary();

module.exports = { cloudinary, uploadFromBuffer };
