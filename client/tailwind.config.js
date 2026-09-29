/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          bg: '#F7F7F5',
          card: '#FFFFFF',
          text: '#30383D',
          muted: '#73777A',
          border: '#D7D7D5',
          silver: '#E5E7EB',
          chrome: '#9CA3AF',
          charcoal: '#30383D',
          dark: '#1F2428',
          accent: '#2B3338',
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
