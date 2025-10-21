/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sansation: ['"Sansation"', 'sans-serif'],
        baloo: ['"Baloo Chettan 2"', 'cursive'],
      },
    },
  },
  plugins: [],
}
