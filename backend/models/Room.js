const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 30 },
  passcode: { type: String, required: true, minlength: 6, maxlength: 6 },
  creatorName: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorRole: { type: String, required: true },
  headcount: { type: Number, default: 1 },
  locked: { type: Boolean, default: true },
  chatHistory: [{ sender: String, text: String, time: String, isSystem: { type: Boolean, default: false } }],
  // 🔥 NAYI FIELD: CANVAS TRACKS KO SAVE RAKHNE KE LIYE 🔥
  canvasTracks: { type: Array, default: [] } 
}, { timestamps: true }); 

module.exports = mongoose.model('Room', roomSchema);