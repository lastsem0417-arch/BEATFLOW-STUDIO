const mongoose = require('mongoose');

const feedPostSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorName: { type: String, required: true },
  creatorRole: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, default: 'General' },
  lookingFor: { type: String, default: 'Collaboration' },
  bounty: { type: String, default: 'TBD' },
  
  contentUrl: { type: String }, 
  lyricsText: { type: String }, 
  status: { type: String, default: 'Open' },

  // 🔥 THE NEW ENGAGEMENT SYSTEM 🔥
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: { type: String },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('FeedPost', feedPostSchema);