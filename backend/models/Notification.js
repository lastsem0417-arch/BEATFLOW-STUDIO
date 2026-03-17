const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jisko notification jayega (Rapper/Producer)
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jisne like/comment kiya (Listener)
  type: { type: String, enum: ['like', 'comment', 'follow'], required: true }, // Action kya tha?
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedPost' }, // Agar like/comment hai toh kis post pe tha
  text: { type: String }, // Agar comment hai toh kya likha
  isRead: { type: Boolean, default: false } // User ne padh liya ya nahi (Red dot ke liye)
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);