/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          blue: {
            600: '#2563eb', // Hex-Wert
            400: '#60a5fa',
          },
          gray: {
            700: '#374151',
            500: '#6b7280',
            300: '#d1d5db',
          },
          red: {
            500: '#ef4444',
            400: '#f87171',
          },
          white: '#ffffff',
          // Weitere Farben...
        },
      },
    },
    plugins: [],
  };