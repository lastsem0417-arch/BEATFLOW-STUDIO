// src/config.ts
export const BACKEND_URL = import.meta.env.MODE === 'development' 
  ? 'import.meta.env.VITE_API_URL' 
  : 'https://beatflow-studio.onrender.com'; // 👈 Tera Live Backend Link