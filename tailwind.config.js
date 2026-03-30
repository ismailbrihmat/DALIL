/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Moroccan-inspired color palette
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#e6d5cc',
          300: '#d4b8a8',
          400: '#c49a7a',
          500: '#b8815b',
          600: '#a66d4a',
          700: '#8b573d',
          800: '#724838',
          900: '#5d3c30',
        },
        moroccan: {
          terracotta: '#C65D3B',
          sand: '#D4A574',
          mint: '#98D8C8',
          saffron: '#F4C430',
          navy: '#1B365D',
          gold: '#C9A961',
          cream: '#FAF7F2',
          medina: '#2D3436',
        }
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
