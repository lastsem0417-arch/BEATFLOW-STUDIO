const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 🔥 SOCKET.IO IMPORTS 🔥
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ==========================================
// 🔥 DYNAMIC CORS SETUP (BULLETPROOF) 🔥
// ==========================================
// Bhai Vite kabhi kabhi port change kar deta hai, isliye common ports daal diye hain
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://localhost:5175', // 🚨 TERA CURRENT FRONTEND PORT YAHAN MISSING THA! 🚨
  'http://localhost:5176',
  'http://localhost:5177',
  'https://beatflow-studio-wnt0.onrender.com' // Tera Live Frontend
];

// 🔥 SOCKET.IO ENGINE SETUP (CRITICAL: 100MB Limit Added) 🔥
const io = new Server(server, {
  maxHttpBufferSize: 1e8, // 🚨 ISKE BINA BADI AUDIO FILE NAHI JAYEGI (100MB limit)
  cors: {
    origin: allowedOrigins, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
  }
});

// Middlewares
app.use(cors({
  origin: allowedOrigins, 
  credentials: true
}));
app.use(express.json({ limit: '100mb' })); 

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
// 🚀 ROUTE & MODEL IMPORTS (ALL AT THE TOP)
// ==========================================
const path = require('path');
const authRoutes = require('./routes/auth'); 
const projectRoutes = require('./routes/projectRoutes');
const lyricsRoutes = require('./routes/lyrics');
const trackRoutes = require('./routes/tracks');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes'); 
const feedRoutes = require('./routes/feed'); 
const nottificationsRoutes = require('./routes/notifications'); 
const adminRoutes = require('./routes/adminRoutes'); 
const collabRoutes = require('./routes/collabRoutes'); 

// 🚨 MODELS IMPORTED ONCE AT THE GLOBAL LEVEL 🚨
const Room = require('./models/Room'); 
const Contract = require('./models/Contract'); 

// MOUNTING ROUTES
app.use('/api/collab', collabRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', nottificationsRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/chat', chatRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/lyrics', lyricsRoutes); 
app.use('/api/tracks', trackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/status', (req, res) => {
  res.json({ status: 'live', message: 'BeatFlow API is working' });
});

// ==========================================
// 🔥 THE WAR ROOM: REAL-TIME SOCKET ENGINE 🔥
// ==========================================
io.on('connection', (socket) => {
  console.log(`⚡ Artist Connected to Studio Network: [Socket ID: ${socket.id}]`);

  // -----------------------------------------------------
  // 🟢 1. EXISTING 1-TO-1 CHAT LOGIC
  // -----------------------------------------------------
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });

  socket.on('send_message', (data) => {
    io.to(data.receiverId).emit('receive_message', data);
  });

  // -----------------------------------------------------
  // 🚀 2. COLLAB STUDIO LOGIC (WebRTC + Group Chat + Canvas)
  // -----------------------------------------------------
  socket.on('join-room', ({ roomId, userDetails }) => {
    socket.join(roomId);
    socket.currentCollabRoom = roomId; 
    
    socket.to(roomId).emit('user-connected', { userId: socket.id, userDetails });
    console.log(`🤝 ${userDetails?.username || 'Artist'} joined Collab Studio: ${roomId}`);
  });

  // 🔥 GROUP CHAT SAVE LOGIC 🔥
  socket.on('send-message', async (messageData) => {
    const room = messageData.roomId || socket.currentCollabRoom;
    if (room) {
      socket.to(room).emit('receive-message', messageData);
      try {
        await Room.findByIdAndUpdate(room, {
          $push: { chatHistory: messageData }
        });
      } catch (error) { console.error("🛑 Chat save error:", error); }
    }
  });

  // 🔥 CANVAS TRACK SAVE LOGIC 🔥
  socket.on('send-track', async (trackData) => {
    const room = trackData.roomId || socket.currentCollabRoom;
    if (room) {
      socket.to(room).emit('receive-track', trackData);
      try {
        await Room.findByIdAndUpdate(room, {
          $push: { canvasTracks: trackData }
        });
      } catch (err) { console.log("Error saving track to DB:", err); }
    }
  });

  // 🔥 TRACK DELETION LOGIC 🔥
  socket.on('delete-track', async ({ roomId, trackId }) => {
    const room = roomId || socket.currentCollabRoom;
    if (room) {
      socket.to(room).emit('track-deleted', trackId);
      console.log(`🗑️ Track ${trackId} deleted in room ${room}`);
      try {
        await Room.findByIdAndUpdate(room, {
          $pull: { canvasTracks: { id: trackId } } 
        });
      } catch (err) { console.log("🛑 Error deleting track from DB:", err); }
    }
  });

  // ==================================================
  // 🔥 SMART CONTRACT & ROYALTY SPLITS LOGIC 🔥
  // ==================================================

  // 1. Generate & Lock Contract
  socket.on('generate-contract', async (contractData) => {
    try {
      if (!contractData || !contractData.roomId) return;
      
      let contract = await Contract.findOne({ roomId: contractData.roomId });
      
      if (!contract) {
        contract = new Contract(contractData);
      } else {
        contract.collaborators = contractData.collaborators;
        contract.status = 'pending';
      }
      await contract.save();

      io.emit('contract-updated', contract);
      console.log(`📜 Contract Generated for Room: ${contractData.roomId}`);
    } catch (err) { console.error("🛑 Contract Gen Error:", err); }
  });

  // 2. Sign Contract (UPDATED TO MATCH USERNAME)
  socket.on('sign-contract', async ({ contractId, userId, username }) => {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) return;

      let allSigned = true;
      contract.collaborators.forEach(c => {
        // Matches DB user ID OR the Username from the mock track data
        if (c.userId === userId || c.username === username) {
          c.hasSigned = true;
          c.userId = userId; // Locks real ID permanently
        }
        if (!c.hasSigned) allSigned = false; 
      });

      if (allSigned) contract.status = 'completed';

      await contract.save();
      
      io.emit('contract-updated', contract);
      console.log(`✅ User ${username} signed contract ${contractId}. Status: ${contract.status}`);
    } catch (err) { console.error("🛑 Signature Error:", err); }
  });

  // 3. Fetch Active Contract for a Room
  socket.on('fetch-contract', async (roomId) => {
    try {
      if (!roomId) return;
      const contract = await Contract.findOne({ roomId });
      if (contract) socket.emit('contract-updated', contract);
    } catch (err) { console.error("🛑 Fetch Contract Error:", err); }
  });

  // --- WEBRTC SIGNALING ---
  socket.on('sending-signal', payload => {
    io.to(payload.userToSignal).emit('user-joined', { signal: payload.signal, callerID: payload.callerID, userDetails: payload.userDetails });
  });

  socket.on('returning-signal', payload => {
    io.to(payload.callerID).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
  });

  socket.on('toggle-media', (payload) => {
    const room = payload.roomId || socket.currentCollabRoom;
    if (room) {
      socket.to(room).emit('peer-media-toggled', { userId: socket.id, state: payload });
    }
  });

  // -----------------------------------------------------
  // 🔴 3. DISCONNECT LOGIC
  // -----------------------------------------------------
  socket.on('disconnect', () => {
    if (socket.currentCollabRoom) {
      socket.to(socket.currentCollabRoom).emit('user-disconnected', socket.id);
    }
    console.log(`🔴 Artist Disconnected: [Socket ID: ${socket.id}]`);
  });
});

app.use((req, res) => { res.status(404).json({ message: `Route ${req.url} not found on this server.` }); });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`🚀 BeatFlow Server & Socket Engine running on port ${PORT}`); });