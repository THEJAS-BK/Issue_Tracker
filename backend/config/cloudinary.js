const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "issue-tracker", // your folder name
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
  transformation: [
    {
      width: 1000,
      height: 1000,
      crop: "limit",
      quality: "auto",
      fetch_format: "auto",
    },
  ],
});

module.exports = {
  cloudinary,
  storage,
};
