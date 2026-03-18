/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GLOBAL BASE COLORS
        brand: {
          onyx: '#030305',  // Deep background
          dark: '#0A0A0C',  // Elevated cards
          pearl: '#F0F0EB', // Premium text
          muted: '#888888', // Subtext
        },
        // ROLE SPECIFIC ACCENTS (Premium Mode)
        producer: {
          DEFAULT: '#D4AF37', // Champagne Gold
          dark: '#997A15',
        },
        rapper: {
          DEFAULT: '#E63946', // Carmine Red
          dark: '#A61E29',
        },
        lyricist: {
          DEFAULT: '#52B788', // Sage Green
          dark: '#2D6A4F',
        },
        listener: {
          DEFAULT: '#8ECAE6', // Ice Blue
          dark: '#219EBC',
        },
        admin: {
          DEFAULT: '#9B2226', // Deep Crimson
          dark: '#660708',
        }
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'], // Luxurious heading look
        mono: ['"JetBrains Mono"', 'Courier New', 'monospace'], // For data/stats
      }
    },
  },
  plugins: [],
}