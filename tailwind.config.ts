/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#3b82f6',
          'primary-dark': '#2563eb',
          'secondary': '#64748b',
          'secondary-dark': '#475569',
        },
      },
    },
    plugins: [],
  }