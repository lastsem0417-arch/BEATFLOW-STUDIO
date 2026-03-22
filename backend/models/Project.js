// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tracks: { type: Array, default: [] },
  lyrics: { type: String, default: '' },
  producerNotes: { type: String, default: '' },
  
  // 🔥 NEW: VIDEO LINK FOR VAULT PLAYBACK 🔥
  videoUrl: { type: String, default: null },

  // 🔥 NAYA CHAT LOG SYSTEM 🔥
  chatLog: [{
    senderId: String,
    text: String,
    timestamp: String
  }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);