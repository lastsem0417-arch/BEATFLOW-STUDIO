const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// 🔥 TERA BOUNCER IMPORT HO GAYA YAHAN 🔥
const { protect } = require('../middleware/authMiddleware'); 

// ==========================================
// @route   GET /api/collab/rooms
// @desc    Fetch all active secure rooms (FEEDS THE SMART SPLITTER)
// @access  Private
// ==========================================
router.get('/rooms', protect, async (req, res) => {
  try {
    // Ye route Smart Splitter ko rooms dega jisme automatically 'canvasTracks' bhi aayenge!
    const rooms = await Room.find({ locked: true }).sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("🛑 Error fetching rooms:", error);
    res.status(500).json({ message: "Server error syncing network." });
  }
});

// ==========================================
// @route   GET /api/collab/rooms/:id
// @desc    Get single room data & chat history (REFRESH FIX)
// @access  Private
// ==========================================
router.get('/rooms/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Session no longer exists." });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error("🛑 Error fetching room details:", error);
    res.status(500).json({ message: "Server error fetching room details." });
  }
});

// ==========================================
// @route   POST /api/collab/rooms
// @desc    Create a new collab room
// @access  Private
// ==========================================
router.post('/rooms', protect, async (req, res) => {
  try {
    // 🚨 THE FIX: Extract creatorName and creatorId from req.body 🚨
    const { name, passcode, creatorRole, creatorName, creatorId } = req.body;

    if (!name || !passcode || passcode.length !== 6) {
      return res.status(400).json({ message: "Invalid Room Name or 6-digit Passcode." });
    }

    // Backend strictly determines the exact identity of the creator
    const exactCreatorName = creatorName || req.user.username || req.user.name;
    const exactCreatorId = creatorId || req.user._id || req.user.id;

    const newRoom = new Room({
      name,
      passcode, 
      creatorName: exactCreatorName, // Saved exactly as it is
      creatorId: exactCreatorId,     // Saved exactly as it is
      creatorRole: creatorRole || req.user.role || 'creator',
      headcount: 1,
      locked: true,
      chatHistory: [], // Empty shuruwat mein
      canvasTracks: [] // Tracks bhi initialize kardo
    });

    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("🛑 Error creating room:", error);
    res.status(500).json({ message: "Failed to initialize session." });
  }
});

// ==========================================
// @route   POST /api/collab/rooms/join
// @desc    Verify Passcode and join room
// @access  Private
// ==========================================
router.post('/rooms/join', protect, async (req, res) => {
  try {
    const { roomId, passcode } = req.body;

    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: "Session no longer exists." });
    }

    if (room.passcode !== passcode) {
      return res.status(401).json({ message: "Access Denied: Invalid Passcode." });
    }

    res.status(200).json({ success: true, message: "Authentication Complete." });
  } catch (error) {
    console.error("🛑 Error joining room:", error);
    res.status(500).json({ message: "Server error during authentication." });
  }
});

module.exports = router;