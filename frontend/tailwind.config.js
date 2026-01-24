import daisyui from 'daisyui'; // [1] Use import instead of require

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui], // [2] Pass the imported variable directly
  daisyui: {
    themes: ["light", "black"], 
  },
};