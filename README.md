<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=001433&height=250&section=header&text=BeatFlow%20Studio&fontSize=70&fontColor=D4AF37&animation=fadeIn&fontAlignY=38&desc=The%20Ultimate%20Collaborative%20SaaS%20for%20Music%20Production&descAlignY=55&descAlign=50" alt="BeatFlow Banner">
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Status-Production%20Ready-10B981?style=for-the-badge&logo=checkmarx&logoColor=white" alt="Status"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Tech-MERN%20Stack-0EA5E9?style=for-the-badge&logo=react&logoColor=white" alt="Tech"></a>
  <a href="#architecture"><img src="https://img.shields.io/badge/RealTime-Socket.io%20%7C%20WebRTC-E63946?style=for-the-badge&logo=socket.io&logoColor=white" alt="RealTime"></a>
  <a href="#dsp"><img src="https://img.shields.io/badge/DSP-Web%20Audio%20API-D4AF37?style=for-the-badge&logo=webaudio&logoColor=black" alt="DSP"></a>
</p>

<h3 align="center">Isolate. Collaborate. Monetize. 🎵</h3>

<p align="center">
  <strong>BeatFlow</strong> is a cutting-edge, role-based collaborative music production operating system. Designed exclusively for Producers, Rappers, and Lyricists to connect in real-time, extract audio stems using neural-inspired DSP, and cryptographically sign master split agreements—all wrapped in a seamless, GSAP-animated cinematic interface.
</p>

<br />

---

## 🌌 The Ecosystem (Role-Based Environments)

BeatFlow isn't just a UI; it acts as a personalized Digital Audio Workstation (DAW) tailored to the specific needs of different music creators.

### 🎹 1. Producer Master (Sonic Architect)
- **Beat Inventory & Explorer:** Manage uploaded beats and explore global frequencies.
- **Interactive Drum Pad:** Real-time beat triggering interface.
- **Upload Portal:** Secure asset management with direct MongoDB integration.
- **AI Stem Mixer:** Built-in DSP engine to manipulate frequencies.

### 🎙️ 2. Vocal Chamber (Rapper)
- **Booth Initialization:** Secure recording environment with draggable webcam feeds.
- **Asset Drop:** Seamlessly upload and sync vocal stems to the collaborative canvas.
- **Global Network Feed:** Connect with producers and lyricists worldwide.

### 📝 3. Lyricist Hub (Writer's Canvas)
- **Ghostwriter Pad:** Distraction-free, focused writing environment.
- **Secure Vault:** Private archive for lyrical assets and unreleased projects.
- **Editorial UI:** Cyber-organic green aesthetic specifically designed for writers.

---

## ✨ Flagship Modules (The Magic Under the Hood)

### ⚖️ 1. Smart Splitter & Legal Engine
*The most advanced royalty management system built natively into a web app.*
- **Automated Split Math:** Dynamically divides remaining percentages equally among collaborators while locking a mandatory 20% platform fee.
- **Strict Owner Verification:** Real-time database syncing ensures only the session creator can lock and propose the master contract.
- **Smart Validation Slider:** Custom UI that guides users to maintain a strict 100% total allocation (`Remaining: 0%`) before allowing contract execution.
- **Vector PDF Generation:** Uses `jsPDF` to generate completely native, high-resolution **Master License Agreements** directly in the browser (No third-party API dependencies). Complete with cryptographic document IDs and visual digital signatures.

### 🎛️ 2. AI Neural Stem Extractor (DSP)
*Browser-based Digital Signal Processing without server-side rendering.*
- **Web Audio API Engine:** Implements cascading Biquad Filters (Double Lowpass for 24dB/oct cutoff, Highpass, Notch) to isolate real-time frequencies.
- **Parametric Controls:** Real-time Gain adjustments, Solo, and Mute functionalities for 4 specific bands (808/Bass, Vocals, Melody, Drums).
- **Blob Memory Management:** Handles local audio file execution using `URL.createObjectURL()` while strictly preventing memory leaks and CORS security muting.

### 🤝 3. Real-Time Collab Studio
*Create together, miles apart.*
- **Socket.io War Room:** Synchronizes project state, live chat, and multi-track canvases across multiple users instantly.
- **WebRTC Integration:** Peer-to-peer signaling for scalable real-time video/audio communication.
- **Passcode Protected Vaults:** Sessions are locked behind generated 6-digit cryptographic keys.

---

## 💻 Tech Stack & Architecture

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,ts,tailwind,gsap,nodejs,express,mongodb" alt="Tech Stack Icons" />
</p>

### Frontend 🎨
* **Core:** React.js + Vite (Configured for global WebRTC processing)
* **Styling:** Tailwind CSS + Custom CSS modules
* **Animation:** GSAP (ScrollTrigger, context management) + Tailwind `animate-in`
* **Data Visualization:** Chart.js (React-Chartjs-2) for dynamic royalty pie charts
* **Document Engine:** jsPDF (Client-side vector document rendering)

### Backend & Real-Time ⚙️
* **Server:** Node.js + Express.js
* **Database:** MongoDB + Mongoose (Strict schema validation)
* **WebSocket Engine:** Socket.io (Configured with `1e8` maxHttpBufferSize to handle large 100MB audio payload syncs)
* **Auth:** JWT (JSON Web Tokens) + Protected Routes

---

## 🧠 Design Philosophy & UI/UX

The UI was meticulously crafted to escape the generic "SaaS Dashboard" look. We opted for a **Premium Editorial Aesthetic**:
- **Typography:** Bold Serif italics (`font-serif italic`) paired with aggressive monospace tracking (`tracking-[0.4em]`).
- **Color Palette:** - Deep Navy (`#001433`) & Gold (`#D4AF37`) for Producers.
  - Charcoal (`#111111`) & Crimson (`#E63946`) for Rappers.
  - Cyber-Organic Off-White (`#F9F8F6`) & Emerald Green (`#10B981`) for Lyricists.
- **Layout Constraints:** Bento-box designs with engineered `h-screen flex-1` wrappers. Instead of generic page flows, it features app-like sticky containers with custom-styled internal scrollbars.
- **Micro-Interactions:** Physical feeling interactions with `active:scale-95`, glowing status dots, and seamless conditional rendering.

---

## 🚀 Run It Locally

**Prerequisites:** Node.js (v18+), MongoDB instance.

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/BeatFlow-Studio.git](https://github.com/yourusername/BeatFlow-Studio.git)
cd BeatFlow-Studio

### 2. Setup the backend
```bash
cd backend
npm install
# Create a .env file with: PORT=5000, MONGO_URI=your_mongo_url, JWT_SECRET=your_secret
node server.js

3. setup the frontend
cd frontend
npm install
npm run dev

