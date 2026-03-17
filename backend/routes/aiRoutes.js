const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

// 🔥 TERI EKDDUM SAHI WALI NAYI KEY YAHAN DAAL
const API_KEY = "AIzaSyABMXplNIj0v-VakbZbi1_IwWO6qwcSqMM"; 

router.post('/generate-bars', protect, async (req, res) => {
  try {
    const { currentLyrics } = req.body;

    console.log("🔍 STEP 1: Scanning Google for your available models...");
    
    // 1. Pehle hum Google se pooch rahe hain ki is key pe kya-kya available hai
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const { data } = await axios.get(listUrl);

    // 2. Hum wo pehla model dhoondh rahe hain jo 'text generation' support karta ho
    const validModel = data.models.find(m => 
        m.supportedGenerationMethods.includes("generateContent") && 
        m.name.includes("gemini")
    );

    if (!validModel) {
        throw new Error("Your API key has NO text models assigned by Google. Check Cloud Console.");
    }

    console.log(`✅ STEP 2: Found working model -> ${validModel.name}`);

    // 3. Ab jo model mila hai (e.g. models/gemini-pro), usko directly hit marenge
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [{
        parts: [{
          text: `You are a legendary Rap Ghostwriter. 
          Topic: "${currentLyrics || 'Start a new banger'}". 
          Write exactly 4 fire rhyming bars. ONLY the lyrics, no conversation.`
        }]
      }]
    };

    console.log("🚀 STEP 3: Firing the Engine...");

    const response = await axios.post(generateUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data && response.data.candidates) {
      const aiBars = response.data.candidates[0].content.parts[0].text;
      console.log("🔥 BOOM! BARS GENERATED SUCCESSFULY!");
      return res.json({ bars: aiBars });
    }

    throw new Error("Google sent an empty response.");

  } catch (error) {
    const errorDetails = error.response ? error.response.data : error.message;
    console.error("❌ THE FINAL BOSS ERROR:", JSON.stringify(errorDetails));
    
    res.status(500).json({ 
      message: "AI Engine Stalled.", 
      details: errorDetails 
    });
  }
});

module.exports = router;