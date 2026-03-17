// backend/models/Track.js
const mongoose = require('mongoose'); // <--- YE LINE ZAROORI THI

const TrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audioUrl: { type: String, required: true },
  trackType: { type: String, enum: ['beat', 'vocal'], default: 'vocal' },
  bpm: { type: Number, default: 120 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Track', TrackSchema);