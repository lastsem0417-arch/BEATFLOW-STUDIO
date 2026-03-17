const express = require('express');
const router = express.Router();
const Project = require('../models/Project'); // 🔥 YE LINE ZAROORI HAI

const { 
  getAllProjects, 
  getMyProjects, 
  createProject, 
  getProjectById, 
  updateProject 
} = require('../controllers/projectController');

const { protect } = require('../middleware/authMiddleware');

// Saare routes pe security (Sirf logged-in users ke liye)
router.use(protect);

// 🔥 SMART SAVE ROUTE (No Duplicates, No Data Mixing) 🔥
router.post('/save', async (req, res) => {
  try {
    const { projectId, name, tracks, lyrics, producerNotes } = req.body;
    
    // 1️⃣ UPDATE EXISTING: Agar projectId aaya hai (Matlab file already Vault me hai)
    if (projectId) {
      // $set use kar rahe hain taaki sirf wahi update ho jo bheja gaya hai.
      // Isse Lyricist ka text aur Rapper ka audio mix/overwrite nahi hoga!
      const updatedProject = await Project.findOneAndUpdate(
        { _id: projectId, creator: req.user._id }, // Sirf creator hi update kar sakta hai
        { 
          $set: { 
            ...(name && { name }),
            ...(tracks && { tracks }),
            ...(lyrics !== undefined && { lyrics }), 
            ...(producerNotes !== undefined && { producerNotes })
          } 
        },
        { new: true } // Return updated document
      );

      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found or unauthorized!" });
      }
      return res.status(200).json(updatedProject);
    } 
    
    // 2️⃣ CREATE NEW: Agar naya project hai toh hi create karo
    else {
      const newProject = new Project({
        name: name || "Untitled Session",
        creator: req.user._id,
        tracks: tracks || [],
        lyrics: lyrics || "",
        producerNotes: producerNotes || ""
      });

      const savedProject = await newProject.save();
      return res.status(201).json(savedProject);
    }
  } catch (err) {
    console.error("Save Error:", err);
    res.status(500).json({ message: "Error saving session to Vault" });
  }
});

// 🔥 DELETE ROUTE (Trash The Project) 🔥
router.delete('/delete/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Sirf wahi project delete hoga jo is user ne banaya hai
    const deletedProject = await Project.findOneAndDelete({ 
      _id: projectId, 
      creator: req.user._id 
    });
    
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found or you don't have the rights to burn it." });
    }
    
    res.json({ message: "Burned successfully! 🔥", id: projectId });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server Error during deletion" });
  }
});

// --- Existing Controllers ---
router.get('/all', getAllProjects);       
router.get('/my-vault', getMyProjects);
router.post('/create', createProject);
router.get('/:id', getProjectById);
router.patch('/update/:id', updateProject);

module.exports = router;