import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// 🔥 THE PROFESSIONAL FIX FOR WEBRTC IN PRODUCTION 🔥
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // simple-peer needs these specific node modules to run in the browser
      include: ['stream', 'util', 'process', 'events', 'buffer'],
    }),
  ],
})