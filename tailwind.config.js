/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  '#FFF0F5',
          100: '#FFD6E8',
          200: '#FFB3D1',
          300: '#FF99C2',
          400: '#FF6FA3',
          500: '#FF4B8B',
          600: '#E63578',
        }
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'pulse-rec': 'pulseRec 1.2s ease-in-out infinite',
      },
      keyframes: {
        marquee:  { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-50%)' } },
        fadeUp:   { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseRec: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.07)', boxShadow: '0 0 0 12px rgba(239,68,68,0.15)' } },
      }
    }
  },
  plugins: []
};