const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  // Jisne upload kiya uski proper ID
  creator:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audioUrl:  { type: String, required: true },
  
  assetType: { 
    type: String, 
    enum: ['beat', 'vocal', 'full_track'], 
    required: true 
  },
  
  // 🔥 SOCIAL FEED CONTROL 🔥
  isPublic:  { type: Boolean, default: true }, // True = Feed pe dikhega
  
  stats: {
    plays: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Fans like karenge
  }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);