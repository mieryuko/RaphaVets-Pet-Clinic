/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        sansation: ['"Sansation"', 'sans-serif'],
        baloo: ['"Baloo Chettan 2"', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'progress-bar': 'progress-bar linear forwards',
        slideDown: 'slideDown 0.3s ease-out',
        fadeIn: 'fadeIn 0.5s ease-out',
        popUp: 'popUp 0.3s ease-out',
        fadeSlideUp: 'fadeSlideUp 0.3s ease-out',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'progress-bar': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        popUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}