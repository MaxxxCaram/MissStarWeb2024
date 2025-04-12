/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./about.html",
    "./company.html",
    "./consortium.html",
    "./dynasty.html",
    "./empower.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'star-black': '#000000',
        'star-gold': '#FFD700',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'stardust': "url('/images/stardust.png')"
      }
    }
  },
  plugins: []
} 