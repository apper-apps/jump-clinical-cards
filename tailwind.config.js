/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2C5F7C",
        secondary: "#4A90A4",
        accent: "#67B26F",
        success: "#67B26F",
        warning: "#F7B731",
        error: "#E85D75",
        info: "#4A90A4",
        surface: "#FFFFFF",
        background: "#F5F7FA",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
      },
      dropShadow: {
        'xl': '0 20px 13px rgb(0 0 0 / 0.03)',
        '2xl': '0 25px 25px rgb(0 0 0 / 0.15)',
      },
    },
  },
  plugins: [],
}