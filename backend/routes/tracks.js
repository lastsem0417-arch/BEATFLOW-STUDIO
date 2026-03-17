const express = require('express');
const router = express.Router();
const Track = require('../models/Track');
const upload = require('../config/cloudinary');

// 1. UPLOAD TRACK (Vocals or Beats)
// Multer Cloudinary ke saath file handle karega aur MongoDB details save karega
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    console.log("--- UPLOAD INITIATED ---");
    const { title, creator, trackType, bpm } = req.body;

    if (!req.file) {
      console.error("❌ Error: No audio file found in request.");
      return res.status(400).json({ message: "Audio file is required" });
    }

    const newTrack = new Track({
      title: title || `Session_Take_${Date.now()}`,
      creator, 
      audioUrl: req.file.path, // Cloudinary Secure URL
      trackType: trackType || 'vocal',
      bpm: bpm || 140
    });

    const savedTrack = await newTrack.save();
    console.log(`✅ Success: Track "${savedTrack.title}" saved for Creator ${creator}`);
    res.status(201).json(savedTrack);

  } catch (err) {
    console.error("❌ Backend Upload Error:", err.message);
    res.status(500).json({ 
        message: "Internal Server Error during upload", 
        error: err.message 
    });
  }
});

// 2. GET USER TRACKS (Specific to a User - for Stems/History)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Fetching tracks for User ID: ${userId}`);

    const tracks = await Track.find({ creator: userId }).sort({ createdAt: -1 });
    
    console.log(`✨ Found ${tracks.length} tracks.`);
    res.status(200).json(tracks);
  } catch (err) {
    console.error("❌ Fetch User Tracks Error:", err.message);
    res.status(500).json({ message: "Error fetching user tracks" });
  }
});

// 3. GET GLOBAL BEATS (For Marketplace - filters only 'beat' type)
router.get('/type/beat', async (req, res) => {
  try {
    console.log("🛒 Accessing Marketplace: Fetching all global beats...");
    const beats = await Track.find({ trackType: 'beat' }).sort({ createdAt: -1 });
    
    res.status(200).json(beats);
  } catch (err) {
    console.error("❌ Marketplace Error:", err.message);
    res.status(500).json({ message: "Error accessing marketplace" });
  }
});

// 4. DELETE TRACK (Clean Up Logic)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Attempting to delete track: ${id}`);

    const deletedTrack = await Track.findByIdAndDelete(id);

    if (!deletedTrack) {
      return res.status(404).json({ message: "Track not found in database" });
    }

    console.log("✅ Track deleted successfully from DB.");
    // Note: Cloudinary se delete karne ke liye uska public_id chaiye hota hai, abhi hum DB clean kar rahe hain.
    res.status(200).json({ message: "Track successfully removed from studio." });
  } catch (err) {
    console.error("❌ Delete Error:", err.message);
    res.status(500).json({ message: "Failed to delete track" });
  }
});

// 5. UPDATE TRACK NAME (Edit Logic)
router.put('/update/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const updatedTrack = await Track.findByIdAndUpdate(
        req.params.id, 
        { title: title }, 
        { new: true }
    );
    console.log(`📝 Track updated: ${updatedTrack.title}`);
    res.status(200).json(updatedTrack);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;