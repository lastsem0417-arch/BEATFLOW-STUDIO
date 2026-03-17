const express = require('express');
const router = express.Router();
const Lyrics = require('../models/Lyrics');

// 1. SAVE NEW DRAFT
router.post('/save', async (req, res) => {
  try {
    const { title, content, creator } = req.body;
    const newDraft = new Lyrics({ title, content, creator });
    await newDraft.save();
    res.status(201).json(newDraft);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. GET ALL NOTES FOR USER
router.get('/user/:userId', async (req, res) => {
  try {
    const notes = await Lyrics.find({ creator: req.params.userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. UPDATE EXISTING NOTE
router.put('/update/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const updated = await Lyrics.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. DELETE NOTE
router.delete('/:id', async (req, res) => {
  try {
    await Lyrics.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;