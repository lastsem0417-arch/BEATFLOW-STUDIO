import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- AUTH & CONTEXT IMPORTS ---
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// 🔥 NAYA: AUDIO CONTEXT IMPORT KIYA
import { AudioProvider } from './context/AudioContext'; 

// --- COMPONENTS ---
import LandingPage from './components/LandingPage'; 
import RoleSelection from './components/RoleSelection';
import ProducerMaster from './components/producer/ProducerMaster'; 
import RapperDashboard from './components/Studio/RapperDashboard';
import UserProfile from './components/UserProfile'; 

// 🔥 LYRICIST IMPORTS
import LyricistMaster from './components/LyricistMaster'; 
import LyricistStudio from './components/lyricist/LyricistStudio';

// 🔥 LISTENER IMPORTS
import ListenerMaster from './components/ListenerMaster';

// 🔥 ADMIN IMPORTS (Dono add kiye hain: Login aur Dashboard)
import AdminLogin from './components/AdminLogin';
import AdminMaster from './components/AdminMaster';

// 🔥 NAYA: GLOBAL AUDIO PLAYER IMPORT KIYA
import GlobalAudioPlayer from './components/GlobalAudioPlayer'; 


// --- MAIN APP ENTRY POINT ---
function App() {
  return (
    <AuthProvider>
      {/* 🔥 AUDIO PROVIDER SE POORE APP KO WRAP KIYA 🔥 */}
      <AudioProvider>
        <Router>
          <main className="relative min-h-screen w-full bg-[#050505] text-[#ebebe6] overflow-hidden font-sans">
            <Routes>
              {/* =========================================
                  🌍 PUBLIC ROUTES (Bina login ke khulenge)
                  ========================================= */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/roles" element={<RoleSelection />} />
              
              {/* 🔥 THE SECRET ADMIN GATEWAY 🔥 */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* =========================================
                  🚫 HIGH SECURITY ZONES (CREATORS ONLY)
                  ========================================= */}
              
              {/* 🎤 RAPPER MODULE */}
              <Route 
                path="/studio/rapper" 
                element={
                  <ProtectedRoute allowedRoles={['rapper']}>
                    <RapperDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* 🎹 PRODUCER MODULE */}
              <Route 
                path="/studio/producer" 
                element={
                  <ProtectedRoute allowedRoles={['producer']}>
                    <ProducerMaster />
                  </ProtectedRoute>
                } 
              />
              
              {/* ✍️ LYRICIST MODULE */}
              <Route 
                path="/studio/lyricist" 
                element={
                  <ProtectedRoute allowedRoles={['lyricist']}>
                    <LyricistMaster />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/studio/lyricist/pad" 
                element={
                  <ProtectedRoute allowedRoles={['lyricist']}>
                    <LyricistStudio />
                  </ProtectedRoute>
                } 
              />

              {/* =========================================
                  🎧 FAN / LISTENER ZONE & SHARED ROUTES
                  ========================================= */}

              {/* 🌐 THE GLOBAL FEED */}
              <Route 
                path="/feed" 
                element={
                  <ProtectedRoute allowedRoles={['listener', 'rapper', 'producer', 'lyricist', 'admin']}>
                    <ListenerMaster />
                  </ProtectedRoute>
                } 
              />

              {/* 🌟 USER PROFILE */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['listener', 'rapper', 'producer', 'lyricist', 'admin']}>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile/:id" 
                element={
                  <ProtectedRoute allowedRoles={['listener', 'rapper', 'producer', 'lyricist', 'admin']}>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />

              {/* =========================================
                  👑 GOD MODE (ADMIN ONLY)
                  ========================================= */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminMaster />
                  </ProtectedRoute>
                } 
              />

            </Routes>

            {/* 🔥 GLOBAL AUDIO PLAYER - Yahan rakhne se ye har page par dikhega aur gaana nahi katega 🔥 */}
            <GlobalAudioPlayer />

          </main>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;