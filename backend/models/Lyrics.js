const mongoose = require('mongoose');

const LyricsSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Verse' },
  content: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastEdited: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Lyrics', LyricsSchema);