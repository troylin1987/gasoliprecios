import flowbite from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}', './node_modules/flowbite-react/lib/esm/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        serif: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
      },
      colors: {
        petrol: '#09110f',
        ember: '#ff7a18',
        aqua: '#12d8c0',
        graphite: '#111315',
      },
      boxShadow: {
        glow: '0 0 28px rgba(18, 216, 192, 0.18)',
        ember: '0 0 28px rgba(255, 122, 24, 0.18)',
      },
    },
  },
  plugins: [flowbite],
};
