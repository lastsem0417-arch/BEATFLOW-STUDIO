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
    resource_type: 'auto', // Audio ke liye ye 'auto' ya 'video' hona zaroori hai
    format: 'mp3', // WAV ko MP3 mein convert kar dega cloud par hi
  },
});

const upload = multer({ storage: storage });

module.exports = upload;