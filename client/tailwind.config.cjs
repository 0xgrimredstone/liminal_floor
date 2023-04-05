/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        siteblack: '#180c0c',
        siteDimBlack: '#45232b',
        siteDarkViolet: '#7c4353',
        siteViolet: '#a56879',
        siteWhite: '#ecf3cb',
        siteFullWhite: '#fdfff2',
      },
      backgroundImage: {
        astral: "url('/src/assets/background/astral.jpg')",
        saiman: "url('/src/assets/background/saiman.jpg')",
        eoaalien: "url('/src/assets/background/eoaalien.jpg')",
        panight: "url('/src/assets/background/panight.jpg')",
        heroImg: "url('/src/assets/background/hero-img.jpg')",
        landing: "url('/src/assets/background/landing.jpg')",
        launchImg: "url('/src/assets/background/launch-img.jpg')",
      },
      fontFamily: {
        libreBaskerville: ['Libre Baskerville', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        mozart: ['Mozart', 'sans-serif'],
        bitDragon: ['bit Dragon', 'sans-serif'],
        connectionII: ['Connection II', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
