// backend/routes/ai.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/rhymes/:word', async (req, res) => {
  try {
    const { word } = req.params;
    // Datamuse API - rel_rhy means direct rhymes
    const response = await axios.get(`https://api.datamuse.com/words?rel_rhy=${word}&max=15`);
    
    // Agar direct rhyme nahi milta, toh sounds-like (sl) try karo
    let rhymes = response.data.map(obj => obj.word);
    
    if (rhymes.length === 0) {
        const fallback = await axios.get(`https://api.datamuse.com/words?sl=${word}&max=10`);
        rhymes = fallback.data.map(obj => obj.word);
    }

    res.json(rhymes);
  } catch (err) {
    res.status(500).json([]);
  }
});

module.exports = router;