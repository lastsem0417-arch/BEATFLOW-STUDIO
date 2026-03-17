const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Track = require('../models/Track'); 
const { protect } = require('../middleware/authMiddleware'); 

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'luxury_secret_key_123', 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ token, user: { id: user._id, username, role } });
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'luxury_secret_key_123', 
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// 🔥🔥🔥 NAYA ROUTE: VERIFY TOKEN WITH DATABASE 🔥🔥🔥
router.get('/me', protect, async (req, res) => {
  try {
    // Password hata kar baaki data le aao
    const user = await User.findById(req.user._id).select('-password'); 
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (err) {
    console.error("Auth Verify Error:", err);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
});

// PROFILE ROUTE (Fetch)
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const tracks = await Track.find({ creator: req.params.id }).sort({ createdAt: -1 });

    res.json({ user: user, tracks: tracks });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// UPDATE PROFILE
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id; 
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = req.body.username || user.username;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      token: req.headers.authorization.split(' ')[1] 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during profile update" });
  }
});

module.exports = router;