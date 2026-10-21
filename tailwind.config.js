/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sf: {
          blue: '#0070D2',
          'blue-dark': '#005FB2',
          'blue-light': '#1589EE',
          navy: '#032D60',
          'navy-dark': '#0B2141',
          'navy-mid': '#0C3B6E',
          green: '#4BCA81',
          orange: '#FFB75D',
          red: '#FF5D5D',
          'gray-cool': '#F3F6FB',
          'gray-border': '#D8DDE6',
          'text-muted': '#706E6B',
        },
      },
      fontFamily: {
        sans: ['"Salesforce Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'gauge-fill': 'gaugeFill 1.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gaugeFill: {
          '0%': { strokeDashoffset: '502' },
          '100%': { strokeDashoffset: 'var(--dash-offset)' },
        },
      },
    },
  },
  plugins: [],
};
