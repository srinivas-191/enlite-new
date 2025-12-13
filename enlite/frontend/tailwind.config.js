/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your SIA Engineering actual blue
        'sia-blue': '#0b365f',
      },
    },
  },
  plugins: [],
}
