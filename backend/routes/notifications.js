const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// 🔥 GET LOGGED IN USER'S NOTIFICATIONS
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username profileImage role') // Sender ki photo aur naam chahiye
      .populate('post', 'title') // Post ka title chahiye
      .sort({ createdAt: -1 })
      .limit(20); // Latest 20 hi dikhayenge feed clear rakhne ke liye

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// 🔥 MARK NOTIFICATIONS AS READ
router.put('/mark-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});

module.exports = router;