/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'fold': '280px', // for foldable devices (extra small)
      },
      colors: {
        ecoGreen: "#2E7D32",
        ecoLight: "#A5D6A7",
        ecoDark: "#1B5E20",
        ecoCream: "#F1F8E9",
        ecoBeige: "#FFF7EC",
        ecoSoft: "#F8F3E7",
        ecoOrange: "#F57C00",
        ecoOrangeLight: "#FFA726",
        ecoYellow: "#CA8A04", // Darker golden yellow (yellow-600)
        ecoYellowLight: "#a18a07ff", // Deep amber/mustard (yellow-700)
        ecoYellowDark: "#EAB308", // Brighter yellow for dark mode accents (yellow-500)
        ecoPurple: "#8B5CF6", // purple-500
        ecoPurpleLight: "#4F46E5", // indigo-600
        adminGreen: "#16a34a", // green-600 - Used for admin sidebar
        // Semantic UI Tokens
        statusSuccess: "#22C55E",
        statusError: "#EF4444",
        statusWarning: "#F59E0B",
        statusInfo: "#3B82F6",
      },
      fontFamily: {
        ecoFont: ["Poppins", "sans-serif"],
        ecoHeading: ["Montserrat", "sans-serif"],
        authFont: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        eco: "0 4px 10px rgba(46, 125, 50, 0.2)",
      },
      borderRadius: {
        "4xl": "2rem",
      },

      /** --------------------------
       *  SIMPLE JUMP ANIMATION
       * -------------------------*/
      keyframes: {
        jump: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '33%': { transform: 'translateY(-20px) scale(1.1)' },
          '66%': { transform: 'translateY(10px) scale(0.95)' },
        }
      },
      animation: {
        jump: "jump 1.2s ease-in-out infinite",
        'slide-in': 'slide-in 0.4s ease-out forwards',
        'slide-out': 'slide-out 0.4s ease-in forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'float': 'float 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};