const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const FeedPost = require('../models/FeedPost');

// 🔥 1. GET OVERALL SYSTEM STATS 🔥
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrops = await FeedPost.countDocuments();
    
    // Kitne Rappers, Producers aur Lyricists hain?
    const producers = await User.countDocuments({ role: 'producer' });
    const rappers = await User.countDocuments({ role: 'rapper' });
    const lyricists = await User.countDocuments({ role: 'lyricist' });

    res.json({
      totalUsers,
      totalDrops,
      breakdown: { producers, rappers, lyricists }
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: 'Server Error fetching stats' });
  }
});

// 🔥 2. GET ALL USERS (For User Management Table) 🔥
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error fetching users' });
  }
});

// 🔥 3. VERIFY A USER (Give Blue Tick) 🔥
router.put('/users/:id/verify', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle verification status
    user.isVerified = !user.isVerified; 
    await user.save();

    res.json({ message: `User ${user.isVerified ? 'Verified ✔️' : 'Un-Verified'}`, user });
  } catch (err) {
    res.status(500).json({ message: "Error verifying user" });
  }
});

// 🔥 4. BAN / DELETE A USER 🚫 🔥
router.delete('/users/:id/ban', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Admin khud ko ban na kar le
    if (user.role === 'admin') {
      return res.status(400).json({ message: "You cannot ban another Admin!" });
    }

    // User ko database se uda do
    await User.findByIdAndDelete(req.params.id);

    // Optional: Agar uske saare posts bhi udane hain toh ye line uncomment kar dena
    // await FeedPost.deleteMany({ creatorId: req.params.id });

    res.json({ message: "User has been Banned & Removed from the network." });
  } catch (err) {
    res.status(500).json({ message: "Error banning user" });
  }
});

// 🔥 5. DELETE ANY POST (CONTENT MODERATION) 🗑️ 🔥
router.delete('/posts/:id', protect, admin, async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Post ko DB se hamesha ke liye uda do
    await FeedPost.findByIdAndDelete(req.params.id);

    res.json({ message: "Post eradicated from the network. 🗑️" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Error deleting post" });
  }
});

module.exports = router;        