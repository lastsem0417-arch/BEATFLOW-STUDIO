const Project = require('../models/Project');

// Sabse upar check kar ye functions exported hain
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('creator', 'username email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ creator: req.user.id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const newProject = new Project({ ...req.body, creator: req.user.id });
    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};