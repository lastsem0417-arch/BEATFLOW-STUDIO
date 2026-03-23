import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// --- AUTH & CONTEXT IMPORTS ---
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AudioProvider } from './context/AudioContext'; 

// --- COMPONENTS ---
import LandingPage from './components/LandingPage'; 
import RoleSelection from './components/RoleSelection';
import ProducerMaster from './components/producer/ProducerMaster'; 
import RapperDashboard from './components/studio/RapperDashboard';
import UserProfile from './components/UserProfile'; 

// 🔥 LYRICIST IMPORTS
import LyricistMaster from './components/LyricistMaster'; 
import LyricistStudio from './components/lyricist/LyricistStudio';

// 🔥 LISTENER IMPORTS
import ListenerMaster from './components/ListenerMaster';

// 🔥 ADMIN IMPORTS 
import AdminLogin from './components/AdminLogin';
import AdminMaster from './components/AdminMaster';

// 🔥 GLOBAL AUDIO PLAYER & PRELOADER
import GlobalAudioPlayer from './components/GlobalAudioPlayer'; 
import CinematicPreloader from './components/CinematicPreloader'; // 👈 THE GATEWAY ADDED

// 🌟 THE PREMIUM MOTION ENGINE IMPORTS 🌟
import SmoothScroll from './components/SmoothScroll';
import CustomCursor from './components/CustomCursor';

/* ==============================================================================
   🎬 THE ANIMATED ROUTES ENGINE (AWWWARDS SECRET)
   Ye component ensure karta hai ki jab page change ho, toh purana page 
   smoothly fade out ho aur naya page smoothly fade in ho.
   ============================================================================== */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    // mode="wait" ensures purana page hatne ke baad hi naya page aayega
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/roles" element={<PageTransition><RoleSelection /></PageTransition>} />
        
        {/* 👑 ADMIN GATEWAY */}
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminMaster /></PageTransition></ProtectedRoute>
        } />
        
        {/* 🎤 RAPPER MODULE */}
        <Route path="/studio/rapper" element={
          <ProtectedRoute allowedRoles={['rapper']}><PageTransition><RapperDashboard /></PageTransition></ProtectedRoute>
        } />
        
        {/* 🎹 PRODUCER MODULE */}
        <Route path="/studio/producer" element={
          <ProtectedRoute allowedRoles={['producer']}><PageTransition><ProducerMaster /></PageTransition></ProtectedRoute>
        } />
        
        {/* ✍️ LYRICIST MODULE */}
        <Route path="/studio/lyricist" element={
          <ProtectedRoute allowedRoles={['lyricist']}><PageTransition><LyricistMaster /></PageTransition></ProtectedRoute>
        } />
        <Route path="/studio/lyricist/pad" element={
          <ProtectedRoute allowedRoles={['lyricist']}><PageTransition><LyricistStudio /></PageTransition></ProtectedRoute>
        } />

        {/* 🎧 FAN / LISTENER ZONE */}
        <Route path="/feed" element={
          <ProtectedRoute allowedRoles={['listener', 'rapper', 'producer', 'lyricist', 'admin']}>
            <PageTransition><ListenerMaster /></PageTransition>
          </ProtectedRoute>
        } />

        {/* 🌟 USER PROFILE */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['listener', 'rapper', 'producer', 'lyricist', 'admin']}>
            <PageTransition><UserProfile /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute allowedRoles={['listener', 'rapper', 'producer', 'lyricist', 'admin']}>
            <PageTransition><UserProfile /></PageTransition>
          </ProtectedRoute>
        } />

      </Routes>
    </AnimatePresence>
  );
}

/* ==============================================================================
   🌌 THE CINEMATIC WIPE WRAPPER
   Har page iske andar wrap hoga.
   ============================================================================== */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

/* ==============================================================================
   🚀 MAIN APP ENTRY POINT
   ============================================================================== */
function App() {
  // 🔥 THE BULLETPROOF FIX: Check session synchronously before rendering 🔥
  // Isse refresh par baar-baar preloader nahi aayega!
  const [showPreloader, setShowPreloader] = useState(() => {
    return sessionStorage.getItem('beatflow_preloader_done') !== 'true';
  });

  return (
    <AuthProvider>
      <AudioProvider>
        <SmoothScroll>
          
          {/* 🎬 Render Preloader only if it's the user's first time in this session */}
          {showPreloader && <CinematicPreloader onComplete={() => setShowPreloader(false)} />}

          {/* Router is pushed out so useLocation works inside AnimatedRoutes */}
          <Router>
            <CustomCursor />

            {/* 🔥 PREMIUM GRAPHITE BASE APPLIED HERE 🔥
              bg-[#111111] -> Deep Graphite Gray
              text-[#F4F5F7] -> Soft Alabaster White
              selection:bg-[#F4F5F7] selection:text-[#111111] -> Silver/White text highlight
            */}
            <main className="relative min-h-screen w-full bg-[#111111] text-[#F4F5F7] overflow-hidden font-sans cursor-none selection:bg-[#F4F5F7] selection:text-[#111111]">
              
              <AnimatedRoutes />

              {/* GLOBAL AUDIO PLAYER - Sits outside routes so music never stops */}
              <GlobalAudioPlayer />

            </main>
          </Router>
        </SmoothScroll>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;