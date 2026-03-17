const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // 🔥 THE SECURITY LOCK: Yahan role strict kar diya hai
  role: { 
    type: String, 
    required: true,
    enum: ['rapper', 'producer', 'lyricist', 'listener', 'admin'], 
    default: 'listener' 
  },

  // 🔥 THE NEW SOCIAL FOUNDATION 🔥
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bio: { type: String, default: 'Making waves in the industry.' },
  profileImage: { type: String, default: '' },

  // 🔥 THE BLUE TICK (VERIFIED BADGE) 🔥
  isVerified: { 
    type: Boolean, 
    default: false 
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);