const User = require('../models/User');
const Track = require('../models/Track'); // 🔥 IMP: Ye line zaroori hai tracks fetch karne ke liye
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 🔥 Global Secret to avoid mismatch
const JWT_SECRET = process.env.JWT_SECRET || 'ARYAN_STUDIO_SECRET_123';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    console.log("Registration Attempt:", { username, email, role });

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    // Salt generation
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role.toLowerCase() 
    });

    // registerUser ke andar ka response aise change kar do:
    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: role.toLowerCase(), // 🚨 FIX: req.body wala role forcefully bhej rahe hain
      token: generateToken(user._id, role.toLowerCase()),
    });
  } catch (error) {
    // 🔥 Duplicate entry handler (Pehle jaisa)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `${field} is already taken! Please try another.` 
      });
    }
    console.error("CRITICAL REGISTER ERROR:", error); 
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login Crash', error: error.message });
  } 
};

// 🔥 NAYA FUNCTION: Profile aur Tracks ka data ek saath bhejne ke liye
exports.getUserProfile = async (req, res) => {
  try {
    // 1. User ki details nikaalo (Password hata ke)
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Is artist/producer ke saare tracks nikaalo
    const tracks = await Track.find({ creator: req.params.id }).sort({ createdAt: -1 });

    // 3. Frontend ko dono cheezein parcel karke bhej do
    res.json({
      user: user,
      tracks: tracks
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};