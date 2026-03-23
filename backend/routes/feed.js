const express = require('express');
const router = express.Router(); 
const { protect } = require('../middleware/authMiddleware');
const FeedPost = require('../models/FeedPost');
const Notification = require('../models/Notification'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage Config
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// 🌍 1. GET ALL POSTS
router.get('/', async (req, res) => {
  try {
    const posts = await FeedPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching global feed' });
  }
});

// 🔥 2. GET USER POSTS
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await FeedPost.find({ creatorId: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user drops' });
  }
});

// 🔥 3. UPLOAD DROP
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, description, genre, lookingFor, bounty, lyricsText } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title/Description missing" });
    }

    const newPost = new FeedPost({
      creatorId: req.user._id,
      creatorName: req.user.username,
      creatorRole: req.user.role,
      creatorProfileImage: req.user.profileImage,
      title,
      description,
      genre: genre || 'General',
      lookingFor: lookingFor || 'Collaboration',
      bounty: bounty || 'TBD',
      lyricsText: lyricsText || '',
      contentUrl: req.file ? `import.meta.env.VITE_API_URL/uploads/${req.file.filename}` : null
    });

    await newPost.save();
    res.status(201).json({ message: "Drop Successful! 🚀" });
  } catch (err) {
    res.status(500).json({ message: "Backend Upload Error" });
  }
});

// 🔥 4. LIKE SYSTEM
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
      if (post.creatorId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.creatorId,
          sender: req.user._id,
          type: 'like',
          post: post._id
        });
      }
    }
    await post.save();
    res.json({ message: isLiked ? "Unliked" : "Liked", likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Like failed" });
  }
});

// 🔥 5. COMMENT SYSTEM
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: req.user._id,
      username: req.user.username,
      text: text
    };

    post.comments.push(newComment);
    await post.save();

    if (post.creatorId.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.creatorId,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        text: text
      });
    }
    res.status(201).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Comment failed" });
  }
});

// 🔥 6. PITCH SYSTEM (Asali Business)
router.post('/:id/pitch', protect, async (req, res) => {
  try {
    const { proposal } = req.body;
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Notification for the Artist
    await Notification.create({
      recipient: post.creatorId,
      sender: req.user._id,
      type: 'comment', // Comment type used for now
      post: post._id,
      text: `⚡ PITCH RECEIVED: "${proposal}"`
    });

    res.status(201).json({ message: "Pitch Sent Successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Pitch delivery failed" });
  }
});

module.exports = router;