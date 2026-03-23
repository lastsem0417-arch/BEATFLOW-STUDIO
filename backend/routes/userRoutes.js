const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Notification = require('../models/Notification'); 
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// 🔥 MULTER: IMAGE UPLOAD SETUP
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'profile-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


// 🚨 ROUTE ORDER IS CRITICAL 🚨

// 1️⃣ THE FIX: '/all' route hamesha sabse upar! (Chat Engine ke liye)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 2️⃣ UPDATE PROFILE (Photo & Bio) - Ise bhi '/:id' se UPAR rakhna hai!
router.put('/update-profile', protect, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Text fields
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    
    // Nayi photo
    if (req.file) {
      user.profileImage = `import.meta.env.VITE_API_URL/uploads/${req.file.filename}`;
    }

    await user.save();
    
    // Naya data bhej do (password hide karke)
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// 3️⃣ GET USER DETAILS (Profile page ke liye) - Ye neeche rahega
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// 4️⃣ FOLLOW / UNFOLLOW A USER
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot follow yourself!" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);

      // 🔥 NOTIFICATION TRIGGER
      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: 'follow'
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: isFollowing ? "Unfollowed" : "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error following user" });
  }
});

module.exports = router;