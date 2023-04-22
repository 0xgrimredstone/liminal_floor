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
