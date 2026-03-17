const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // 🔥 Isko false kar diya taaki direct DM ho sake bina kisi project ke!
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);