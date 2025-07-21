/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Category colors for appointments
        'work': '#3174ad',
        'personal': '#28a745',
        'medical': '#dc3545',
        'education': '#6f42c1',
        'social': '#ffc107'
      }
    },
  },
  plugins: [],
}