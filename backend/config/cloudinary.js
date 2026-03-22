const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxury_studio_recordings',
    // 🔥 THE FIX: Use 'video' for BOTH audio and video uploads in Cloudinary. 
    // 'auto' gets confused by browser-generated blobs.
    resource_type: 'video', 
  },
});

const upload = multer({ storage: storage });

module.exports = upload;