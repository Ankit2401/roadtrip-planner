const defaultTheme = require('tailwindcss/defaultTheme'); // Yeh line add karein

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cars24-blue': '#164489',
        'cars24-secondary': '#f3f4f6',
        'cars24-accent-orange': '#f7931e', 
      },
      // FontFamily ko yahan add karein
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}