/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'Neue Haas Grotesk', 'Helvetica Neue', 'Arial', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        stamp: ['Oswald', 'Impact', 'sans-serif'],
        utility: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        widest: '0.25em',
        luxury: '0.4em',
        extreme: '0.6em',
        signature: '0.35em',
      },
      colors: {
        // ─── Unified Site Palette ───
        cream: '#F7F3EC',        // Warm light sections
        ivory: '#FAFAF7',        // Neutral light sections
        night: '#0A0A0A',        // ALL dark sections (one black)
        charcoal: '#1A1A1A',     // Dark text, overlays
        gold: '#D4AF37',         // Primary accent
        goldLight: '#F5E6A3',    // Hover/glow states
        goldDark: '#AA771C',     // Deep gold for gradients
        warmGray: '#8A8578',     // Muted text on light bg

        // Legacy aliases (keeping for backward compat)
        sandalBg: '#F7F3EC',
        darkText: '#111111',
        sandalAccent: '#D8C3A5',
        coffeeAccent: '#3A2A20',
        borderGlass: 'rgba(17, 17, 17, 0.12)',
        bgGlass: 'rgba(255, 255, 255, 0.45)',
        
        darkBg: '#0A0A0A',
        lightText: '#F5F5F0',
        menuAccent: '#D4AF37',
        menuBorder: 'rgba(245, 245, 240, 0.12)',
        menuBgGlass: 'rgba(15, 15, 17, 0.45)',
        
        primaryWhite: '#FFFFFF',
        luxury: {
          dark: '#0A0A0A',
          light: '#F5F5F7',
          gray: '#86868B',
        },

        // Turf Page
        turf: {
          bg: '#0A0A0A',
          forest: '#0E1D13',
          green: '#2E8B57',
          lime: '#7CFC00',
          gold: '#D4AF37',
          warm: '#F7F5EF',
          muted: '#4A5A50',
          red: '#8B2500',
        },

        // Events Section
        ev: {
          bg: '#FAFAF7',
          card: '#FDFBF7',
          text: '#1a1a1a',
          accent: '#c91010',
        },
      },
      backdropBlur: {
        premium: '20px',
      }
    },
  },
  plugins: [],
}
