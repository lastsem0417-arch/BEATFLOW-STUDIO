const mongoose = require('mongoose');

// Collaborators ka sub-schema (Har artist ki details aur unka signature status)
const collaboratorSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, required: true },
  split: { type: Number, required: true },
  hasSigned: { type: Boolean, default: false },
  color: { type: String, default: '#111111' }
});

// Main Contract Schema
const contractSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true }, // Ek collab room ka ek hi final contract hoga
  projectName: { type: String, required: true },
  initiator: { type: String, required: true }, // Jis bande ne contract generate kiya (e.g., Producer)
  platformFee: { type: Number, default: 20 },  // BeatFlow ka 20% cut
  collaborators: [collaboratorSchema],         // Saare artists ki list
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'completed'], 
    default: 'pending' 
  }
}, { timestamps: true }); // timestamps se createdAt aur updatedAt automatically ban jayega

module.exports = mongoose.model('Contract', contractSchema);