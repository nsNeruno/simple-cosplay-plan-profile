/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme color palette
        dark: {
          bg: '#1e1e1e',        // Main background - dark gray, not pure black
          surface: '#2d2d2d',   // Elevated surfaces (cards, modals)
          hover: '#3a3a3a',     // Hover states
          border: '#404040',    // Borders and dividers
        },
      },
      fontFamily: {
        // Material Design typography
        sans: [
          'Roboto',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
