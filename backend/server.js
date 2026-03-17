const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 🔥 SOCKET.IO IMPORTS 🔥
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// 🔥 HTTP SERVER WRAPPER 🔥
const server = http.createServer(app);

// 🔥 SOCKET.IO ENGINE SETUP 🔥
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// ==========================================
// 🚀 ROUTE IMPORTS (Yahan theek kiya hai!)
// ==========================================
// Yahan hum auth.js file ko require kar rahe hain
const authRoutes = require('./routes/auth'); 
const projectRoutes = require('./routes/projectRoutes');
const lyricsRoutes = require('./routes/lyrics');
const trackRoutes = require('./routes/tracks');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes'); 
const feedRoutes = require('./routes/feed'); // Naya Global Feed route
const path = require('path');
const nottificationsRoutes = require('./routes/notifications'); // Naya Notifications route
const adminRoutes = require('./routes/adminRoutes'); // Naya Admin route

// ==========================================
// 🚀 ROUTE MOUNTING
// ==========================================
// Aur yahan hum us import kiye hue variable ko use kar rahe hain
// server.js mein
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/auth', authRoutes); 
app.use('/api/chat', chatRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/lyrics', lyricsRoutes); 
app.use('/api/tracks', trackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Status check 
app.get('/api/status', (req, res) => {
  res.json({ status: 'live', message: 'BeatFlow API is working' });
});

// 🔥 THE WAR ROOM: REAL-TIME CHAT LOGIC 🔥
io.on('connection', (socket) => {
  console.log(`⚡ Artist Connected to Studio Network: [Socket ID: ${socket.id}]`);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`📡 Artist ${userId} joined their frequency.`);
  });

  socket.on('send_message', (data) => {
    console.log(`💬 Message from ${data.senderId} to ${data.receiverId}`);
    io.to(data.receiverId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Artist Disconnected: [Socket ID: ${socket.id}]`);
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found on this server.` });
});

const PORT = process.env.PORT || 5000;

// 🔥 APP.LISTEN KI JAGAH SERVER.LISTEN 🔥
server.listen(PORT, () => {
  console.log(`🚀 BeatFlow Server & Socket Engine running on http://localhost:${PORT}`);
});