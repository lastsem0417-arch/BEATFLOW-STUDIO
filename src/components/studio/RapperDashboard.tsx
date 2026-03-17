\import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';

import StudioMaster from './StudioMaster';
import RapperNetwork from './RapperNetwork';
import GlobalFeed from '../feed/GlobalFeed';
import CreateDropModal from '../feed/CreateDropModal';
import NotificationBell from '../feed/NotificationBell';

import { useAudio } from '../../context/AudioContext';

export default function RapperDashboard() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDawOpen, setIsDawOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'chat' | 'vault'>('home');
  const [showDropModal, setShowDropModal] = useState(false);

  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userId = user.id || user._id;

  const [producerBeats, setProducerBeats] = useState<any[]>([]);
  const [vaultProjects, setVaultProjects] = useState<any[]>([]);

  // 🔥 DATA FETCH
  useEffect(() => {
    if (!sessionStorage.getItem('beatflow_user')) {
      navigate('/roles');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        const beatsRes = await axios.get('http://localhost:5000/api/tracks/type/beat', config);
        setProducerBeats(Array.isArray(beatsRes.data) ? beatsRes.data : []);

        const vaultRes = await axios.get('http://localhost:5000/api/projects/my-vault', config);
        setVaultProjects(Array.isArray(vaultRes.data) ? vaultRes.data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // 💀 GSAP ANIMATIONS
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {

      gsap.from(".sidebar-item", {
        x: -60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out"
      });

      gsap.from(".header-anim", {
        y: -40,
        opacity: 0,
        duration: 1.2
      });

      gsap.from(".main-anim", {
        y: 60,
        opacity: 0,
        scale: 0.96,
        duration: 1.2
      });

      gsap.from(".card-anim", {
        y: 100,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: "power4.out"
      });

    }, containerRef);

    return () => ctx.revert();
  }, [activeTab, producerBeats, vaultProjects]);

  const handlePlayPreview = (beat: any) => {
    if (currentTrack?._id === beat._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: beat._id,
        title: beat.title,
        contentUrl: beat.audioUrl,
        creatorName: beat.creatorName || 'Producer',
        creatorRole: 'producer',
        creatorId: beat.creator
      });
    }
  };

  if (isDawOpen) {
    return <StudioMaster />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-[#ebebe6] flex font-sans">

      {/* SIDEBAR */}
      <aside className="w-20 sticky top-0 h-screen border-r border-white/5 bg-[#080808] flex flex-col items-center py-10 z-50">

        <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center">
          MIC
        </div>

        <nav className="flex flex-col gap-6 flex-1 mt-12 w-full px-4">

          {["home","network","vault","chat"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`sidebar-item w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                activeTab === tab ? 'bg-purple-600 text-white' : 'bg-white/5 text-neutral-500 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}

        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="header-anim h-24 px-12 flex justify-between items-center border-b border-white/5">

          <h2 className="text-3xl font-serif italic">
            {activeTab.toUpperCase()}
          </h2>

          <div className="flex gap-4">
            <NotificationBell />
            <button onClick={() => setShowDropModal(true)} className="px-6 py-2 bg-emerald-500 text-black rounded-full text-xs hover:scale-105 transition">
              Drop
            </button>
            <button onClick={() => setIsDawOpen(true)} className="px-6 py-2 bg-white text-black rounded-full text-xs hover:scale-105 transition">
              Studio
            </button>
          </div>

        </header>

        {/* MAIN CONTENT */}
        <main className="main-anim flex-1 p-10">

          {activeTab === 'home' && (
            <div className="grid md:grid-cols-3 gap-8">

              {producerBeats.map((beat) => (
                <div
                  key={beat._id}
                  className="card-anim bg-[#111] p-6 rounded-2xl hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-500"
                >
                  <h3 className="text-lg font-bold">{beat.title}</h3>

                  <button
                    onClick={() => handlePlayPreview(beat)}
                    className="mt-4 px-4 py-2 bg-purple-600 rounded-full text-xs"
                  >
                    {currentTrack?._id === beat._id && isPlaying ? "Pause" : "Play"}
                  </button>
                </div>
              ))}

            </div>
          )}

          {activeTab === 'network' && <GlobalFeed />}
          {activeTab === 'chat' && <RapperNetwork userId={userId} setIsDawOpen={setIsDawOpen} />}
          
          {activeTab === 'vault' && (
            <div className="grid md:grid-cols-3 gap-8">
              {vaultProjects.map((p) => (
                <div key={p._id} className="card-anim bg-[#111] p-6 rounded-2xl">
                  <h3>{p.name}</h3>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {showDropModal && <CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} />}

    </div>
  );
}