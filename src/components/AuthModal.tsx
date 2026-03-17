import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  role: string;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export default function AuthModal({ role, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const modalRef = useRef(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    gsap.fromTo(modalRef.current, 
      { opacity: 0, scale: 0.9, y: 20 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power4.out" }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    
    console.log(`Sending to: http://localhost:5000/api/auth/${endpoint}`, formData);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/${endpoint}`, 
        {
          ...formData,
          role: role.toLowerCase()
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Success Response:", res.data);
      
      const token = res.data.token;
      const userObj = res.data.user || res.data; 
      
      const dbRole = userObj.role ? userObj.role.toLowerCase() : '';
      const portalRole = role.toLowerCase();

      // ==========================================
      // 🔥 THE ULTIMATE STRICT ROLE LOCK 🔥
      // ==========================================
      if (isLogin && dbRole !== portalRole) {
        // Agar DB ka role aur jis portal se login kar raha hai wo alag hain -> BLOCK!
        alert(`ACCESS DENIED 🛑: Ye email ek [${dbRole.toUpperCase()}] ka hai. Aap [${portalRole.toUpperCase()}] portal se login nahi kar sakte!`);
        return; // Yahi se wapas bhej do, aage ka code nahi chalega
      }

      // Agar Lock pass ho gaya, toh data save karo
      const userDataToSave = { ...userObj, token };
      
      // Global Auth State update karo (sessionStorage mein save ho jayega)
      login(userDataToSave);
      
      // Modal close karne ke liye parent ko notify karo
      onSuccess(res.data);

      // Sahi dashboard par redirect karo
      if (dbRole === 'rapper') {
        navigate('/studio/rapper');
      } else if (dbRole === 'producer') {
        navigate('/studio/producer');
      } else if (dbRole === 'lyricist') {
        navigate('/studio/lyricist');
      } else if (dbRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); 
      }

    } catch (err: any) {
      console.error("Axios Error Details:", err.response);
      alert(err.response?.data?.message || "Invalid Email or Password!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <div ref={modalRef} className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#111111] p-10 shadow-2xl relative">
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
            ✕
        </button>

        <h2 className="mb-2 font-serif text-3xl text-[#EBEBE6]">
          {isLogin ? 'Welcome Back' : 'Join the Studio'}
        </h2>
        <p className="mb-8 text-xs uppercase tracking-widest text-neutral-500">Entering as {role}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <input 
              type="text" placeholder="Username" required
              className="w-full border-b border-neutral-800 bg-transparent py-2 text-sm outline-none focus:border-[#EBEBE6] transition-colors text-white"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          )}
          <input 
            type="email" placeholder="Email" required
            className="w-full border-b border-neutral-800 bg-transparent py-2 text-sm outline-none focus:border-[#EBEBE6] transition-colors text-white"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full border-b border-neutral-800 bg-transparent py-2 text-sm outline-none focus:border-[#EBEBE6] transition-colors text-white"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button type="submit" className="mt-4 w-full rounded-full bg-[#EBEBE6] py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {isLogin ? 'Access Studio' : 'Create Profile'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="mt-6 w-full text-center text-[10px] uppercase tracking-widest text-neutral-500 hover:text-[#EBEBE6]"
        >
          {isLogin ? "Don't have an account? Register" : "Already a member? Login"}
        </button>
      </div>
    </div>
  );
}