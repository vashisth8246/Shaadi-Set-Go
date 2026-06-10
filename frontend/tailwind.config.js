/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#c9a84c',
        'rose-pink': '#c9a84c',
      },
      fontFamily: {
        playfair: ['"Cormorant Garamond"', 'serif'],
        inter: ['Jost', 'sans-serif'],
        jost: ['Jost', 'sans-serif'],
        cursive: ['"Great Vibes"', 'cursive'],
      },
    },
  },
  plugins: [],
};
