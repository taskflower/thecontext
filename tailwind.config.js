/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],

  content: [
    "./index.html",
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@stoplight/json-schema-viewer/**/*.{js,css}',
    './node_modules/@stoplight/mosaic/**/*.{js,css}',
  ],
  theme: {
    extend: {
    }
  },
  plugins: [],
};
