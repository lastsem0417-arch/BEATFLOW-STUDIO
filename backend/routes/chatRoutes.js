const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// 1. Send a new message
router.post('/send', protect, async (req, res) => {
  try {
    const { projectId, receiverId, text, timestamp } = req.body;
    const newMessage = new Message({
      projectId,
      senderId: req.user._id,
      receiverId,
      text,
      timestamp
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Error saving message" });
  }
});

// 2. Get all messages for a specific project
router.get('/:projectId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});
// 🔥 NAYA: GET 1-ON-1 DIRECT MESSAGES 🔥
router.get('/direct/:otherUserId', protect, async (req, res) => {
  try {
    // Database se wo saare messages lao jahan Sender main hu aur Receiver wo hai, YA Sender wo hai aur Receiver main hu!
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.otherUserId },
        { senderId: req.params.otherUserId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error("DM Fetch Error:", err);
    res.status(500).json({ message: "Error fetching direct messages" });
  }
});

module.exports = router;