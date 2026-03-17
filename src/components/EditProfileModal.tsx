import React, { useState } from 'react';
import axios from 'axios';

export default function EditProfileModal({ user, onClose, onSuccess }: any) {
  const [bio, setBio] = useState(user.bio || '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.profileImage || null);
  const [loading, setLoading] = useState(false);

  // File select hone par preview dikhane ka jaadu
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('bio', bio);
    if (file) {
      formData.append('profileImage', file);
    }

    try {
      const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
      const res = await axios.put('http://localhost:5000/api/users/update-profile', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${loggedInUser.token}` 
        }
      });
      onSuccess(res.data); // Wapas UserProfile ko naya data bhejo
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      {/* Background Blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      {/* The Modal */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent">
          <h3 className="text-2xl font-serif italic text-white">Edit Identity</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          
          {/* Avatar Upload (Premium UI) */}
          <div className="flex flex-col items-center gap-4">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 group-hover:border-blue-500 flex items-center justify-center overflow-hidden transition-all bg-white/5">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover scale-110" />
                ) : (
                  <span className="text-2xl opacity-50">📷</span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white">Upload</span>
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-mono">Tap to change avatar</p>
          </div>

          {/* Bio Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-black">Your Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about your sound..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-blue-500/50 outline-none transition-all h-28 resize-none custom-scrollbar placeholder:text-neutral-700"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 py-4 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
          >
            {loading ? 'Saving Identity...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}